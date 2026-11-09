from pydantic import BaseModel, Field, field_validator


class OrderItem(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    quantity: int = Field(ge=1, le=1000)
    unit_price: float = Field(gt=0, le=1000000)


class ParsedOrder(BaseModel):
    customer_name: str = "Customer"
    items: list[OrderItem] = Field(min_length=1, max_length=30)
    notes: str = ""
    currency: str = "USD"


class ParseOrderRequest(BaseModel):
    message: str = Field(min_length=5, max_length=3000)


class CreatePaymentRequest(BaseModel):
    items: list[OrderItem] = Field(min_length=1, max_length=30)
    customer_name: str = Field(default="Customer", max_length=120)


class CapturePaymentRequest(BaseModel):
    order_id: str = Field(min_length=5, max_length=80)
