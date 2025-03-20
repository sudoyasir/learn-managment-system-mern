const stripe = require("../../helpers/stripe");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderDate,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    const CLIENT_URL = "http://localhost:5173";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: courseTitle,
            images: [courseImage],
          },
          unit_amount: Math.round(coursePricing * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${CLIENT_URL}/payment-success`,
      cancel_url: `${CLIENT_URL}/payment-cancel`,
    });

    // Immediately create an order and set status to 'paid'
    const order = new Order({
      userId,
      userName,
      userEmail,
      orderStatus: "confirmed",
      paymentMethod: "card",
      paymentStatus: "paid",
      orderDate,
      paymentId: session.id,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    });

    await order.save();

    // Add course to StudentCourses collection
    const studentCourses = await StudentCourses.findOne({ userId });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId,
        title: courseTitle,
        instructorId,
        instructorName,
        dateOfPurchase: orderDate,
        courseImage,
      });
      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId,
        courses: [{
          courseId,
          title: courseTitle,
          instructorId,
          instructorName,
          dateOfPurchase: orderDate,
          courseImage,
        }],
      });
      await newStudentCourses.save();
    }

    // Return session details
    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        orderId: order._id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error while creating order!",
    });
  }
};

module.exports = { createOrder };
