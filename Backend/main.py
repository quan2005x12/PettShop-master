# PETT Shop Backend - Final Sync
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from dotenv import load_dotenv
import os
import datetime
import json
import uuid

# Load environment variables
load_dotenv()

import models, schemas, database, auth

app = FastAPI(title="PETT Shop API")

# Ensure all tables exist (creates new ones without dropping existing)
models.Base.metadata.create_all(bind=database.engine)

@app.on_event("startup")
def check_db_initialized():
    db = database.SessionLocal()
    try:
        product_count = db.query(models.Product).count()
        if product_count == 0:
            print("\n" + "!"*60)
            print("WARNING: Database is empty!")
            print("Please run 'python init_db.py' to seed the initial data.")
            print("!"*60 + "\n")
    except Exception as e:
        print(f"Error checking database: {e}")
    finally:
        db.close()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for testing to eliminate CORS issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_msg = f"GLOBAL ERROR: {str(exc)}\n{traceback.format_exc()}"
    print(error_msg)
    
    try:
        with open("error_log.txt", "a", encoding="utf-8") as f:
            f.write(f"\n--- {datetime.datetime.now()} ---\n")
            f.write(error_msg)
            f.write("\n" + "="*50 + "\n")
    except:
        pass

    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

@app.get("/api/products", response_model=List[schemas.Product])
def get_products(
    category: str = None, 
    pet_type: str = None, 
    q: str = None,
    sort: str = "popular",
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Product)
    
    if category and category not in ["all", "undefined"]:
        query = query.filter(models.Product.category == category)
    
    if pet_type and pet_type not in ["all", "undefined"]:
        from sqlalchemy import or_
        types = pet_type.split(",")
        # Use simple LIKE filtering for SQLite JSON strings as it's more reliable
        type_filters = [models.Product.pet_type.like(f"%{t}%") for t in types]
        query = query.filter(or_(*type_filters))

    if q and q != "undefined":
        from sqlalchemy import func
        q_lower = q.lower()
        query = query.filter(
            (func.lower(models.Product.name).contains(q_lower)) | 
            (func.lower(models.Product.summary).contains(q_lower))
        )
    
    products = query.all()
    
    # Sorting logic
    if sort == "price_asc":
        products.sort(key=lambda x: x.price if x.price is not None else 0)
    elif sort == "price_desc":
        products.sort(key=lambda x: x.price if x.price is not None else 0, reverse=True)
    elif sort == "newest":
        products.reverse()
    
    return products

@app.get("/api/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: str, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/blogs", response_model=List[schemas.BlogPost])
def get_blogs(db: Session = Depends(database.get_db)):
    return db.query(models.BlogPost).all()

@app.get("/api/blogs/{blog_id}", response_model=schemas.BlogPost)
def get_blog(blog_id: str, db: Session = Depends(database.get_db)):
    blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog

@app.post("/api/auth/google", response_model=schemas.Token)
def google_auth(auth_data: schemas.GoogleAuth, db: Session = Depends(database.get_db)):
    try:
        idinfo = auth.verify_google_token(auth_data.id_token)
        if not idinfo:
            raise HTTPException(status_code=400, detail="Invalid Google Token")
        
        email = idinfo.get("email")
        full_name = idinfo.get("name", "User")
        profile_pic = idinfo.get("picture")

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            # Tự động cấp quyền admin cho email chỉ định
            role = "admin" if email == "Mahoangvuhy2k5@gmail.com" else "customer"
            user = models.User(
                email=email,
                full_name=full_name,
                profile_pic=profile_pic,
                role=role
            )
            db.add(user)
        else:
            user.full_name = full_name
            user.profile_pic = profile_pic
            if email == "Mahoangvuhy2k5@gmail.com":
                user.role = "admin"
            
        db.commit()
        db.refresh(user)

        access_token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/health")
def health_check(db: Session = Depends(database.get_db)):
    db_status = "ok"
    try:
        db.query(models.User).first()
    except Exception:
        db_status = "error"
    return {"status": "ok", "database": db_status}

# --- ADMIN ENDPOINTS ---
@app.get("/api/admin/stats", response_model=schemas.AdminStats)
def get_admin_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_revenue = db.query(models.Order).filter(models.Order.status == "completed").with_entities(models.Order.total_amount).all()
    revenue_sum = sum([r[0] for r in total_revenue]) if total_revenue else 0
    
    total_orders = db.query(models.Order).count()
    total_users = db.query(models.User).count()
    
    # Simple count of subscription-related items in orders for now
    # In a real app, this would query a dedicated Subscriptions table
    active_subs = db.query(models.Order).filter(models.Order.items.contains("subscription")).count()
    
    return {
        "total_revenue": revenue_sum,
        "total_orders": total_orders,
        "active_subscriptions": active_subs,
        "total_users": total_users
    }

@app.get("/api/admin/sales-chart", response_model=schemas.SalesChartData)
def get_sales_chart(
    period: str = "week",
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from datetime import datetime, timedelta
    import calendar
    today = datetime.utcnow()
    
    daily_sales = []
    
    if period == "week":
        start_of_week = today - timedelta(days=today.weekday()) # Monday
        days_map = {0: "T2", 1: "T3", 2: "T4", 3: "T5", 4: "T6", 5: "T7", 6: "CN"}
        for i in range(7):
            current_date = start_of_week + timedelta(days=i)
            next_date = current_date + timedelta(days=1)
            
            day_revenue = db.query(models.Order).filter(
                models.Order.created_at >= current_date.replace(hour=0, minute=0, second=0),
                models.Order.created_at < next_date.replace(hour=0, minute=0, second=0),
                models.Order.status.in_(["completed", "confirmed"])
            ).with_entities(models.Order.total_amount).all()
            
            total_day_sum = sum([r[0] for r in day_revenue]) if day_revenue else 0
            daily_sales.append({"date": days_map[i], "amount": total_day_sum})
            
    elif period == "month":
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        _, last_day = calendar.monthrange(today.year, today.month)
        
        week_ranges = [(1, 7), (8, 14), (15, 21), (22, last_day)]
        
        for i, (start_d, end_d) in enumerate(week_ranges):
            start_date = start_of_month.replace(day=start_d)
            if end_d == last_day:
                next_date = start_of_month.replace(day=1) + timedelta(days=last_day)
            else:
                next_date = start_of_month.replace(day=end_d + 1)
                
            week_revenue = db.query(models.Order).filter(
                models.Order.created_at >= start_date,
                models.Order.created_at < next_date,
                models.Order.status.in_(["completed", "confirmed"])
            ).with_entities(models.Order.total_amount).all()
            
            total_week_sum = sum([r[0] for r in week_revenue]) if week_revenue else 0
            daily_sales.append({"date": f"Tuần {i+1}", "amount": total_week_sum})

    return {"daily_sales": daily_sales}

@app.get("/api/admin/recent-orders")
def get_recent_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin)):
    # Lấy 5 đơn hàng mới nhất, join với bảng User để lấy tên và email
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(5).all()
    
    result = []
    for order in orders:
        user = db.query(models.User).filter(models.User.id == order.user_id).first()
        result.append({
            "id": order.id,
            "user_name": user.full_name if user else "Khách vãng lai",
            "user_email": user.email if user else "N/A",
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at.isoformat()
        })
    return result

# --- ADMIN PRODUCTS ---
@app.get("/api/admin/products", response_model=List[schemas.Product])
def admin_get_products(
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Product).all()

@app.post("/api/admin/products", response_model=schemas.Product)
def admin_create_product(
    product_data: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    # Simple slugify for ID
    import re
    product_id = re.sub(r'[^a-z0-9]+', '-', product_data.name.lower()).strip('-')
    
    # Check if ID exists
    existing = db.query(models.Product).filter(models.Product.id == product_id).first()
    if existing:
        product_id = f"{product_id}-{str(uuid.uuid4())[:4]}"
        
    new_product = models.Product(
        id=product_id,
        **product_data.model_dump()
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/api/admin/products/{product_id}", response_model=schemas.Product)
def admin_update_product(
    product_id: str,
    product_data: schemas.ProductUpdate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(
    product_id: str,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}

@app.post("/api/orders")
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Recalculate total amount on server side for security and check stock
    calculated_total = 0
    valid_items = []
    
    for item in order_data.items:
        product_id = item.get("id")
        quantity = int(item.get("quantity", 1))
        
        # Special handling for subscriptions (they might not be in the products table)
        if str(product_id).startswith("plan-") or item.get("category") == "subscription":
            price = int(item.get("price", 0))
            calculated_total += price * quantity
            valid_items.append(item)
            continue

        db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=400, detail=f"Sản phẩm ID {product_id} không tồn tại")
        
        if db_product.stock < quantity:
            raise HTTPException(status_code=400, detail=f"Sản phẩm {db_product.name} không đủ tồn kho (còn lại: {db_product.stock})")
        
        # Deduct stock
        db_product.stock -= quantity
        
        calculated_total += db_product.price * quantity
        valid_items.append({
            "id": db_product.id,
            "name": db_product.name,
            "price": db_product.price,
            "quantity": quantity,
            "images": db_product.images
        })

    # Recalculate total amount on server side with discounts and shipping
    product_subtotal = 0
    subscription_subtotal = 0
    for item in valid_items:
        if str(item.get("id")).startswith("plan-") or item.get("category") == "subscription":
            subscription_subtotal += int(item.get("price", 0)) * int(item.get("quantity", 1))
        else:
            product_subtotal += int(item.get("price", 0)) * int(item.get("quantity", 1))

    # Apply discount based on current user tier (only on products)
    discount = 0
    if current_user.subscription_tier == "vip":
        discount = int(product_subtotal * 0.10)
    elif current_user.subscription_tier == "pro":
        discount = int(product_subtotal * 0.05)
    
    # Apply shipping fee
    subtotal = product_subtotal + subscription_subtotal
    shipping = 0 if (subtotal >= 500000 or subtotal == 0) else 30000
    
    final_total = subtotal + shipping - discount

    new_order = models.Order(
        order_code=f"PETT-{str(uuid.uuid4())[:8].upper()}",
        user_id=current_user.id,
        items=valid_items,
        total_amount=final_total,
        payment_method=order_data.payment_method,
        shipping_address=order_data.shipping_address,
        customer_phone=order_data.customer_phone,
        status="pending"
    )
    db.add(new_order)
    
    # Update user subscription tier if a plan is purchased
    for item in valid_items:
        pid = str(item.get("id"))
        if pid == "plan-vip":
            current_user.subscription_tier = "vip"
        elif pid == "plan-pro" and current_user.subscription_tier not in ["vip"]:
            current_user.subscription_tier = "pro"
        elif pid == "plan-basic" and current_user.subscription_tier not in ["vip", "pro"]:
            current_user.subscription_tier = "basic"

    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/api/orders", response_model=List[schemas.OrderResponse])
def get_user_orders(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    return orders

# --- ADMIN ORDERS ---
@app.get("/api/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order_detail(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Kiểm tra quyền: Chỉ admin hoặc chính chủ đơn hàng mới được xem
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    return order

@app.get("/api/admin/orders")
def admin_get_orders(
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    result = []
    for order in orders:
        owner = db.query(models.User).filter(models.User.id == order.user_id).first()
        result.append({
            "id": order.id,
            "order_code": order.order_code,
            "user_id": order.user_id,
            "items": order.items,
            "total_amount": order.total_amount,
            "status": order.status,
            "payment_method": order.payment_method,
            "shipping_address": order.shipping_address,
            "customer_phone": order.customer_phone,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "customer_name": owner.full_name if owner else "N/A",
            "customer_email": owner.email if owner else "N/A"
        })
    return result

@app.put("/api/admin/orders/{order_id}/status")
def admin_update_order_status(
    order_id: int,
    status_data: schemas.OrderStatusUpdate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "confirmed", "shipping", "completed", "cancelled"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return {"detail": "Order status updated", "new_status": order.status}

# --- ADMIN USERS ---
@app.get("/api/admin/users", response_model=List[schemas.AdminUserResponse])
def admin_get_users(
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()

# --- ADMIN BLOGS ---
@app.get("/api/admin/blogs", response_model=List[schemas.BlogPost])
def admin_get_blogs(
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    return db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).all()

@app.post("/api/admin/blogs", response_model=schemas.BlogPost)
def admin_create_blog(
    blog_data: schemas.BlogPostCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    # Check if ID already exists
    existing = db.query(models.BlogPost).filter(models.BlogPost.id == blog_data.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Blog ID already exists")
    
    new_blog = models.BlogPost(
        id=blog_data.id,
        title=blog_data.title,
        category=blog_data.category,
        excerpt=blog_data.excerpt,
        content=blog_data.content,
        image_url=blog_data.image_url,
        read_time=blog_data.read_time,
        author=blog_data.author
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog

@app.put("/api/admin/blogs/{blog_id}", response_model=schemas.BlogPost)
def admin_update_blog(
    blog_id: str,
    blog_data: schemas.BlogPostUpdate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_data = blog_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(blog, key, value)
    
    db.commit()
    db.refresh(blog)
    return blog

@app.delete("/api/admin/blogs/{blog_id}")
def admin_delete_blog(
    blog_id: str,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(blog)
    db.commit()
    return {"detail": "Blog post deleted"}

# --- REVIEWS API ---

@app.get("/api/products/{product_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_product_reviews(product_id: str, db: Session = Depends(database.get_db)):
    reviews = db.query(models.Review).filter(
        models.Review.product_id == product_id
    ).order_by(models.Review.created_at.desc()).all()
    return reviews

@app.post("/api/products/{product_id}/reviews", response_model=schemas.ReviewResponse)
def create_review(
    product_id: str,
    review_data: schemas.ReviewCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Clamp rating 1-5
    rating = max(1, min(5, review_data.rating))

    review = models.Review(
        product_id=product_id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_pic=current_user.profile_pic,
        rating=rating,
        comment=review_data.comment
    )
    db.add(review)
    db.flush()

    # Recalculate product rating & count
    all_reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    product.reviews_count = len(all_reviews)
    product.rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1) if all_reviews else 5.0

    db.commit()
    db.refresh(review)
    return review

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
