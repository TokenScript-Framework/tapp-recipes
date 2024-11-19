
import Link from "next/link";
import Image from "next/image";
import opensearSVG from "../public/images/opensea.svg"

export function Footer() {
  return (
    <footer className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              
            <Image src={opensearSVG} alt="logo" width={32} height={32} />
              <span className="text-lg font-semibold">Tapp For OpenSea</span>
            </Link>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end space-x-6">
            {/* <Link
              href="#"
              className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
            >
              Contact Us
            </Link> */}
          </nav>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Tapp For OpenSea. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
