
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-5 mx-auto mt-6 lg:mt-10 bg-primary-800 text-white">
      <div className="max-w-screen-xl px-4 py-4 mx-auto lg:px-20">
        <div className="flex flex-col items-center justify-center text-center">
          <Link to="/" className="flex items-center justify-center gap-2 text-white mb-2">
            <div className="w-8 h-8 bg-white text-primary-800 rounded flex items-center justify-center font-bold">P</div>
            <span className="self-center text-2xl font-black sm:text-3xl whitespace-nowrap">
              Pastein
            </span>
          </Link>

          <p className="my-2 leading-tight text-center text-primary-200 text-sm max-w-2xl px-4">
            Pastein is the best online text storage service for sharing code and notes online,
            Pastein is also the best platform for saving and sharing text and code.
          </p>
        </div>

        <ul className="flex flex-wrap items-center justify-center space-x-4 space-y-2 mt-4 text-sm md:text-base">
          <li><a href="#" className="text-primary-50 hover:underline">Terms of service</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">Privacy Policy</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">About</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">Contact</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">Report Abuse</a></li>
        </ul>

        <div className="my-5 border-t opacity-10 border-primary-200 w-full"></div>

        <div className="mb-3 text-center">
          <p className="mt-4 text-sm text-primary-200 opacity-85">
            © 2023-2026 <a href="#" className="font-bold hover:underline">Pastein™</a>. All rights reserved.
          </p>
        </div>

        <div className="flex justify-center space-x-5 mt-4">
          {/* Social Icons placeholders */}
          <a href="#" className="text-primary-200 hover:text-white">FB</a>
          <a href="#" className="text-primary-200 hover:text-white">IG</a>
          <a href="#" className="text-primary-200 hover:text-white">TG</a>
        </div>
      </div>
    </footer>
  );
}
