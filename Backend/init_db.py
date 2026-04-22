import json
import os
from database import SessionLocal, engine
import models

# Create tables
models.Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    
    # Check if products already exist
    if db.query(models.Product).first():
        print("Database already initialized.")
        db.close()
        return

    # Import Products
    products_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extracted_products.json')
    if os.path.exists(products_path):
        with open(products_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
            for p_data in products_data:
                # Add default values for missing fields from basic extraction
                product = models.Product(
                    id=p_data['id'],
                    name=p_data['name'],
                    summary=p_data.get('summary', p_data['description']),
                    description=p_data.get('description', ''),
                    price=p_data['price'],
                    original_price=p_data.get('original_price', p_data['price'] * 1.2),
                    category=p_data['category'],
                    pet_type=p_data['pet_type'].split(',') if isinstance(p_data['pet_type'], str) else p_data['pet_type'],
                    images=[p_data['image_url']],
                    stock=10,
                    rating=4.8,
                    reviews_count=124,
                    benefits=[
                        "Nguyên liệu 100% tự nhiên, không chất bảo quản",
                        "Giàu vitamin và khoáng chất thiết yếu",
                        "Hỗ trợ hệ tiêu hóa và tăng cường miễn dịch"
                    ]
                )
                db.add(product)
        print(f"Imported {len(products_data)} products.")

    # Import Blogs
    blogs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extracted_blogs.json')
    if os.path.exists(blogs_path):
        with open(blogs_path, 'r', encoding='utf-8') as f:
            blogs_data = json.load(f)
            for b_data in blogs_data:
                blog = models.BlogPost(
                    id=b_data['id'],
                    title=b_data['title'],
                    category=b_data['category'],
                    excerpt=b_data['excerpt'],
                    content=b_data['content'],
                    image_url=b_data['image_url'],
                    read_time=b_data['read_time'],
                    author=b_data['author']
                )
                db.add(blog)
        print(f"Imported {len(blogs_data)} blogs.")

    db.commit()
    db.close()
    print("Database initialization complete.")

if __name__ == "__main__":
    init_db()
