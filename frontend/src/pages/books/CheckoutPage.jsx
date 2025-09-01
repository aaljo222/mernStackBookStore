// src/pages/CheckoutPage.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { useCreateOrderMutation } from "../../redux/features/orders/ordersApi";

const CheckoutPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const total = cartItems.reduce(
    (acc, item) => acc + Number(item?.newPrice || 0),
    0
  );
  const totalPriceDisplay = total.toFixed(2);

  const { user } = useAuth(); // ← currentUser → user 로 통일
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      country: "",
      state: "",
      zipcode: "",
    },
  });

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [isChecked, setIsChecked] = useState(false);

  // 로그인 안 했으면 로그인 유도
  useEffect(() => {
    if (!user) {
      Swal.fire({
        title: "Please login",
        text: "You must be logged in to place an order.",
        icon: "info",
        confirmButtonText: "Go to Login",
      }).then(() => navigate("/login"));
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    if (!user) return; // 가드
    if (!isChecked) {
      Swal.fire("Agreement required", "Please accept the terms.", "warning");
      return;
    }
    if (cartItems.length === 0) {
      Swal.fire("Cart is empty", "Add items before checkout.", "info");
      return;
    }

    const newOrder = {
      name: data.name,
      email: user.email,
      address: {
        street: data.address, // ← 누락되어 있던 address 반영
        city: data.city,
        country: data.country,
        state: data.state,
        zipcode: data.zipcode,
      },
      phone: data.phone,
      productIds: cartItems.map((item) => item?._id),
      totalPrice: Number(total.toFixed(2)), // 서버엔 숫자로 전달
    };

    try {
      await createOrder(newOrder).unwrap(); // RTK Query
      await Swal.fire({
        title: "Order Confirmed",
        text: "Your order was placed successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      navigate("/orders");
    } catch (error) {
      console.error("Error placing order:", error);
      const msg =
        error?.data?.message ||
        error?.error ||
        "Failed to place an order. Please try again.";
      Swal.fire("Error", msg, "error");
    }
  };

  if (isLoading || isSubmitting) return <div>Loading...</div>;

  return (
    <section>
      <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
        <div className="container max-w-screen-lg mx-auto">
          <div>
            <div>
              <h2 className="font-semibold text-xl text-gray-600 mb-2">
                Cash On Delivery
              </h2>
              <p className="text-gray-500 mb-2">
                Total Price: ${totalPriceDisplay}
              </p>
              <p className="text-gray-500 mb-6">
                Items: {cartItems.length > 0 ? cartItems.length : 0}
              </p>
            </div>

            <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8"
                noValidate
              >
                <div className="text-gray-600">
                  <p className="font-medium text-lg">Personal Details</p>
                  <p>Please fill out all the fields.</p>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                    <div className="md:col-span-5">
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        {...register("name", { required: "Name is required" })}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        disabled
                        defaultValue={user?.email || ""}
                        placeholder="email@domain.com"
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        type="text" // ← 숫자 대신 텍스트로
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder="+123 456 7890"
                        {...register("phone", {
                          required: "Phone is required",
                        })}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label htmlFor="address">Address / Street</label>
                      <input
                        id="address"
                        type="text"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        {...register("address", {
                          required: "Address is required",
                        })}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        {...register("city", { required: "City is required" })}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="country">Country / region</label>
                      <input
                        id="country"
                        type="text"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        {...register("country", {
                          required: "Country is required",
                        })}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.country.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="state">State / province</label>
                      <input
                        id="state"
                        type="text"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        {...register("state", {
                          required: "State is required",
                        })}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="zipcode">Zipcode</label>
                      <input
                        id="zipcode"
                        type="text"
                        className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        {...register("zipcode", {
                          required: "Zipcode is required",
                        })}
                      />
                      {errors.zipcode && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {errors.zipcode.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-5 mt-3">
                      <div className="inline-flex items-center">
                        <input
                          id="billing_same"
                          type="checkbox"
                          className="form-checkbox"
                          onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <label htmlFor="billing_same" className="ml-2">
                          I agree to the{" "}
                          <Link className="underline underline-offset-2 text-blue-600">
                            Terms &amp; Conditions
                          </Link>{" "}
                          and{" "}
                          <Link className="underline underline-offset-2 text-blue-600">
                            Shopping Policy
                          </Link>
                          .
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-5 text-right">
                      <div className="inline-flex items-end">
                        <button
                          type="submit"
                          disabled={!isChecked || isSubmitting}
                          className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                        >
                          {isSubmitting ? "Placing..." : "Place an Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* 장바구니 비어있을 때 안내 */}
            {cartItems.length === 0 && (
              <p className="text-center text-gray-500">
                Your cart is empty.{" "}
                <Link className="text-blue-600 underline" to="/">
                  Go shopping
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
