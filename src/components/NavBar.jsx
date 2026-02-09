
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                {/* <img class="block w-auto h-9" src="..." alt="PasteLink.ID"> */}
                <div className="w-8 h-8 bg-primary-600 rounded mr-2 flex items-center justify-center text-white font-bold">P</div>

                <h2 className="ml-2"><span className="self-center text-lg font-black dark:text-white sm:text-xl whitespace-nowrap">
                  Paste<span className="text-primary-700 dark:text-primary-300">in</span>
                </span></h2>
              </Link>
            </div>

            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
              <Link className="inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-primary-700 transition duration-150 ease-in-out" to="/">
                Home
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            <div className="sm:flex">
              <Link to="/create" className="inline-flex items-center px-4 py-2 font-semibold text-sm text-white bg-primary-600 rounded-md shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Create Paste
              </Link>
            </div>

            <div className="hidden space-x-5 sm:-my-px sm:flex">
              <Link className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out" to="/login">
                Login
              </Link>
              <Link className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out" to="/register">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
