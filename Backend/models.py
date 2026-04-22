from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(JSON, nullable=True)
    profile_pic = Column(String, nullable=True)
    role = Column(String, default="customer") # 'admin' or 'customer'
    subscription_tier = Column(String, default="free") # 'free', 'plus', 'pro', 'ultra'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="owner")

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True) # slug as ID
    name = Column(String, index=True)
    summary = Column(String)
    description = Column(Text)
    price = Column(Integer)
    original_price = Column(Integer, nullable=True)
    category = Column(String, index=True)
    pet_type = Column(JSON) # List of pet types
    images = Column(JSON) # List of image URLs
    benefits = Column(JSON, nullable=True) # List of {icon, title, desc}
    weight = Column(String, nullable=True)
    stock = Column(Integer, default=10)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    items = Column(JSON) # List of items in order
    total_amount = Column(Integer)
    status = Column(String, default="pending")
    payment_method = Column(String)
    shipping_address = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="orders")

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(String, primary_key=True, index=True) # slug as ID
    title = Column(String)
    category = Column(String)
    excerpt = Column(Text)
    content = Column(Text)
    image_url = Column(String)
    read_time = Column(Integer)
    author = Column(String, default="Admin")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name = Column(String)
    user_pic = Column(String, nullable=True)
    rating = Column(Integer, default=5)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
