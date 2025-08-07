import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleCreateOrder() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "confirmed",
      paymentMethod: "cod", // Changed from paypal to cash on delivery
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      setIsProcessing(false);
      if (data?.payload?.success) {
        toast({
          title: "Order created successfully!",
          variant: "success",
        });
        navigate("/shop/account");
      } else {
        toast({
          title: data?.payload?.message || "Failed to create order",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 lg:p-8">
      <div className="flex flex-col gap-4">
        <Address
          currentSelectedAddress={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cartItems && cartItems.items && cartItems.items.length > 0 ? (
              cartItems.items.map((item) => (
                <UserCartItemsContent
                  key={item?.productId}
                  cartItem={item}
                  showQuantity={false}
                />
              ))
            ) : (
              <p className="text-gray-500">No items in cart</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-semibold mb-4">Order Total</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totalCartAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${totalCartAmount.toFixed(2)}</span>
          </div>
        </div>
        <Button
          onClick={handleCreateOrder}
          disabled={isProcessing}
          className="w-full mt-4"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
