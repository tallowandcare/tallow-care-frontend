import { useState } from "react";
import axios from "axios";
import useScrollReveal from "../hooks/useScrollReveal";

export default function Contact({ showToast }) {

  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [processingSeconds, setProcessingSeconds] = useState(0);

  const [cooldown, setCooldown] = useState(0);

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pet: "🐕 Dog",
    message: "",
    newsletter: false,
  });

  useScrollReveal();

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    const updatedValue =
      type === "checkbox"
        ? checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));


    // =========================
    // EMAIL VALIDATION
    // =========================

    if (name === "email") {

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (value.trim() === "") {

        setErrors((prev) => ({
          ...prev,
          email: "",
        }));

      }

      else if (!emailRegex.test(value)) {

        setErrors((prev) => ({
          ...prev,
          email: "❌ Invalid email format",
        }));

      }

      else {

        setErrors((prev) => ({
          ...prev,
          email: "✅ Valid email",
        }));

      }

    }


    // =========================
    // PHONE VALIDATION
    // =========================

    if (name === "phone") {

      const cleanNumber =
        value.replace(/\D/g, "");

      const phoneRegex =
        /^[6-9]\d{9}$/;

      if (cleanNumber === "") {

        setErrors((prev) => ({
          ...prev,
          phone: "",
        }));

      }

      else if (!phoneRegex.test(cleanNumber)) {

        setErrors((prev) => ({
          ...prev,
          phone: "❌ Invalid mobile number",
        }));

      }

      else {

        setErrors((prev) => ({
          ...prev,
          phone: "✅ Valid mobile number",
        }));

      }

    }

  };



  // =========================
  // HANDLE SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading || cooldown > 0) return;


    // BLOCK INVALID DATA

    if (

      errors.email.includes("❌") ||

      errors.phone.includes("❌")

    ) {

      showToast?.(
        "Please enter valid details ❌"
      );

      return;
    }


    setLoading(true);

    let seconds = 0;

    const processingTimer =
      setInterval(() => {

        seconds++;

        setProcessingSeconds(seconds);

      }, 1000);


    try {

      const res = await axios.post(

        "http://localhost:5000/contact/send",

        formData

      );


      clearInterval(processingTimer);

      setProcessingSeconds(0);


      if (res.data.success) {

        setLoading(false);

        setSubmitted(true);

        showToast?.(
          "Your message delivered 🐾"
        );


        // RESET FORM

        setFormData({

          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          pet: "🐕 Dog",
          message: "",
          newsletter: false,

        });


        // RESET ERRORS

        setErrors({
          email: "",
          phone: "",
        });


        // REMOVE SUCCESS STATE

        setTimeout(() => {

          setSubmitted(false);

        }, 3000);


        // COOLDOWN TIMER

        let timeLeft = 60;

        setCooldown(timeLeft);

        const timer =
          setInterval(() => {

            timeLeft--;

            setCooldown(timeLeft);

            if (timeLeft <= 0) {

              clearInterval(timer);

            }

          }, 1000);

      }

    }

    catch (err) {

      clearInterval(processingTimer);

      setLoading(false);

      setProcessingSeconds(0);

      console.log(err);

      showToast?.(

        err.response?.data?.message ||

        "Failed ❌"

      );

    }

  };



  // =========================
  // JSX UI
  // =========================

  return (

    <section
      id="contact"
      className="contact-section section-padding page-top"
    >

      <div className="contact-grid">

        {/* LEFT SIDE */}

        <div className="contact-left sr from-left">

          <span
            className="section-tag"
            style={{ textAlign: "left" }}
          >
            Get In Touch
          </span>

          <h2>
            Let's Talk About Your Pet's Needs
          </h2>

          <p>

            Have questions about our products?
            Need personalised recommendations?

            Our pet care experts are here to help
            you find the perfect solution
            for your furry friend.

          </p>


          <div className="contact-info">

            <div className="contact-item">

              <div className="contact-icon">
                📞
              </div>

              <div>

                <h4>
                  Call Us
                </h4>

                <p>
                  <a href="tel:+919457294984">+91 9457294984</a>
                  <br />
                  Mon–Fri, 9am–6pm EST
                </p>

              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                ✉️
              </div>

              <div>

                <h4>
                  Email Us
                </h4>

                <p>
<a 
  href="https://mail.google.com/mail/?view=cm&to=tallowandcare@gmail.com"
  target="_blank"
  rel="noopener noreferrer"
>
  tallowandcare@gmail.com
</a>
  <br />
  We reply within 24 hours
</p>

              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                📍
              </div>

              <div>

                <h4>
                  Visit Us
                </h4>

                <p>
                  <a href="https://maps.app.goo.gl/u3jSuNRAPp5hRijG8?g_st=aw" target="_blank" rel="noopener noreferrer">
                    View on Google Maps
                  </a>            
                  Open Mon–Sat, 10am–5pm
                </p>

              </div>

            </div>

          </div>

        </div>



        {/* RIGHT FORM */}

        <form
          className="contact-form sr from-right"
          onSubmit={handleSubmit}
        >

          {/* NAME ROW */}

          <div className="form-row">

            <div className="form-group">

              <label>
                First Name
              </label>

              <input
                type="text"
                name="firstName"
                placeholder="Rohan"
                value={formData.firstName}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                placeholder="Gupta"
                value={formData.lastName}
                onChange={handleChange}
              />

            </div>

          </div>



          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="rohan@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {

              errors.email && (

                <p
                  style={{

                    color:
                      errors.email.includes("✅")
                        ? "limegreen"
                        : "red",

                    fontSize: "14px",

                    marginTop: "6px",

                  }}
                >

                  {errors.email}

                </p>

              )

            }

          </div>



          {/* PHONE */}

          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              required
            />

            {

              errors.phone && (

                <p
                  style={{

                    color:
                      errors.phone.includes("✅")
                        ? "limegreen"
                        : "red",

                    fontSize: "14px",

                    marginTop: "6px",

                  }}
                >

                  {errors.phone}

                </p>

              )

            }

          </div>



          {/* PET */}

          <div className="form-group">

            <label>
              Select your pet
            </label>

            <select
              name="pet"
              value={formData.pet}
              onChange={handleChange}
            >

              <option>
                🐕 Dog
              </option>

              <option>
                🐈 Cat
              </option>

              <option>
                🐇 Rabbit
              </option>

              <option>
                Other
              </option>

            </select>

          </div>



          {/* MESSAGE */}

          <div className="form-group">

            <label>
              Your Message
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your pet..."
              required
            />

          </div>



          {/* CHECKBOX */}

          <div className="form-checkbox">

            <input
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
            />

            <label htmlFor="newsletter">

              I'd love to receive
              pet care tips and offers

            </label>

          </div>



          {/* BUTTON */}

          <button

            type="submit"

            disabled={
              loading ||
              cooldown > 0
            }

            className="btn-submit"

            style={{

              opacity:
                loading ||
                cooldown > 0
                  ? 0.7
                  : 1,

              cursor:
                loading ||
                cooldown > 0
                  ? "not-allowed"
                  : "pointer",

              transition:
                "all .4s",

              background:
                submitted
                  ? "var(--color-sage)"
                  : "",

            }}

          >

            {

              loading ? (

                <>
                  ⏳ Processing your message ({processingSeconds}s)
                </>

              )

              : submitted ? (

                <>
                  ✅ Sent! Your message has been delivered 🐾
                </>

              )

              : cooldown > 0 ? (

                <>
                  🕒 Please wait {cooldown}s
                </>

              )

              : (

                <>
                  Send Message ✉️
                </>

              )

            }

          </button>

        </form>

      </div>

    </section>

  );

}