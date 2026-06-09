import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft__inner">

        <div className="ft__grid">
          {/* Column 1: Resources */}
          <div className="ft__col">
            <h3 className="ft__col-head">Resources</h3>
            <ul className="ft__links">
              <li><a href="#" className="ft__link">Find a Store</a></li>
              <li><a href="#" className="ft__link">Order Tracking</a></li>
              <li><a href="#" className="ft__link">Size Guides</a></li>
              <li><a href="#" className="ft__link">Pet Care Tips</a></li>
              <li><a href="#" className="ft__link">FAQs</a></li>
            </ul>
          </div>

          {/* Column 2: Help */}
          <div className="ft__col">
            <h3 className="ft__col-head">Help</h3>
            <ul className="ft__links">
              <li><a href="#" className="ft__link">Get Help</a></li>
              <li><a href="#" className="ft__link">Shipping & Delivery</a></li>
              <li><a href="#" className="ft__link">Returns & Exchanges</a></li>
              <li><a href="#" className="ft__link">Contact Us</a></li>
              <li><a href="#" className="ft__link">Appointment Support</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="ft__col">
            <h3 className="ft__col-head">Company</h3>
            <ul className="ft__links">
              <li><a href="#" className="ft__link">About K-LABT</a></li>
              <li><a href="#" className="ft__link">Careers</a></li>
              <li><a href="#" className="ft__link">News</a></li>
              <li><a href="#" className="ft__link">Sustainability</a></li>
              <li><a href="#" className="ft__link">Veterinary Partners</a></li>
            </ul>
          </div>

          {/* Column 4: Promotions & Discounts */}
          <div className="ft__col">
            <h3 className="ft__col-head">Promotions & Discounts</h3>
            <ul className="ft__links">
              <li><a href="#" className="ft__link">All Promotions</a></li>
              <li><a href="#" className="ft__link">Student Discount</a></li>
              <li><a href="#" className="ft__link">Membership Benefits</a></li>
              <li><a href="#" className="ft__link">Gift Cards</a></li>
              <li><a href="#" className="ft__link">Refer a Friend</a></li>
            </ul>
          </div>
        </div>

        {/* Fine print row */}
        <div className="ft__rule" />
        <div className="ft__fine">
          <span className="ft__copyright">&copy; 2026 K-LABT. All rights reserved.</span>
          <div className="ft__legal">
            <a href="#" className="ft__legal-link">Privacy Policy</a>
            <span className="ft__dot" />
            <a href="#" className="ft__legal-link">Terms of Use</a>
            <span className="ft__dot" />
            <a href="#" className="ft__legal-link">Supply Chain Act</a>
            <span className="ft__dot" />
            <a href="#" className="ft__legal-link">Vietnam</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
