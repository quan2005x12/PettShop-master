from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class Benefit(BaseModel):
    title: str
    desc: str

class ProductBase(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = None
    category: str
    pet_type: Any # Flexible type
    summary: str
    description: str
    images: Any # Flexible type
    rating: float = 5.0
    reviews_count: int = 0
    benefits: Optional[Any] = None
    weight: Optional[str] = None
    stock: int = 10

    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str # MUST BE STR

class BlogPostBase(BaseModel):
    id: str
    title: str
    category: str
    excerpt: str
    content: str
    image_url: str
    read_time: int
    author: str
    created_at: datetime

class BlogPost(BlogPostBase):
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "customer"
    subscription_tier: str = "free"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    profile_pic: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleAuth(BaseModel):
    id_token: str

class AdminStats(BaseModel):
    total_revenue: int
    total_orders: int
    active_subscriptions: int
    total_users: int

class DailySales(BaseModel):
    date: str
    amount: int

class SalesChartData(BaseModel):
    daily_sales: List[DailySales]

# --- Admin CRUD Schemas ---

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None
    weight: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_code: str
    user_id: Optional[int] = None
    items: Any
    total_amount: int
    status: str
    payment_method: Optional[str] = None
    shipping_address: Optional[str] = None
    customer_phone: Optional[str] = None
    created_at: datetime
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[Any]
    total_amount: int
    payment_method: str
    shipping_address: Optional[str] = None
    customer_phone: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str  # pending, confirmed, shipping, completed, cancelled

class BlogPostCreate(BaseModel):
    id: str
    title: str
    category: str
    excerpt: str
    content: str
    image_url: str
    read_time: int = 5
    author: str = "Admin"

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    read_time: Optional[int] = None

class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    subscription_tier: str = "free"
    profile_pic: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: str

class ReviewResponse(BaseModel):
    id: int
    product_id: str
    user_id: int
    user_name: str
    user_pic: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True
