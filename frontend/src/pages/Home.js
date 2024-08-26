import React, { useState } from "react";
import { Link } from 'react-router-dom';
import logo from './logo.png';

const Home = () => {
    return (
        <div>
            <nav className="bg-[#FCFFFC] p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center flex-shrink-0 text-[#5A9367] mr-6">
                    <span className="font-semibold text-xl">Sorrel Finance</span>
                </div>
                <div className="block lg:hidden">
                    <button
                    className="flex items-center px-3 py-2 border rounded text-gray-300 border-gray-400 hover:text-white hover:border-white"
                    onClick={() => {
                        // Add functionality for mobile menu toggle here
                        console.log('Mobile menu clicked');
                    }}
                    >
                    <svg
                        className="h-3 w-3 fill-current"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Menu</title>
                        <path
                        d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"
                        />
                    </svg>
                    </button>
                </div>
                <div className="hidden lg:block">
                    <ul className="flex space-x-4">
                        <li>
                            <a
                                href="/app"
                                className="block w-full py-2 px-4 text-[#040F0F] bg-[#90FCF9] rounded-md text-center transition duration-300 ease-in-out uppercase font-medium truncate hover:bg-[#FCFFFC]"
                            >
                                Launch App
                            </a>
                        </li>
                    </ul>
                </div>
                </div>
            </nav>
            <div className="bg-[#FCFFFC] h-screen flex items-center justify-center">
            <div className="max-w-7xl w-full px-4 flex">
                <div className="flex flex-col">
                <h1 className="text-9xl text-[#040F0F]">Welcome</h1>
                <p className="text-3xl text-[#040F0F] mt-6">
                    To the first lending platform aimed at bringing funding into the education industry through Open Campus & EDU Chain.
                </p>
                <ul className="flex space-x-4 mt-6">
                    <li>                    
                    <a
                        href="/app"
                        className="block py-2 px-4 text-[#040F0F] bg-[#90FCF9] rounded-md text-center transition duration-300 ease-in-out uppercase font-medium truncate hover:bg-[#FCFFFC]"
                    >
                        Enter
                    </a>
                    </li>
                </ul>
                </div>
                <div className="ml-auto">
                    <img src={logo} alt="Logo" className="w-128 h-auto" />
                </div>
            </div>
            </div>
            <footer className="bg-[#5A9367] text-[#FCFFFC] py-4 text-center">
                <div className="flex justify-center items-center">
                    <p className="mr-2">Powered by EDU Chain.</p>
                    <a
                    href="https://twitter.com/kirillrybkov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[#FCFFFC] hover:text-blue-400"
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 fill-current"
                        viewBox="0 0 24 24"
                    >
                        <path
                        d="M23.891 4.579c-.828.368-1.716.616-2.646.733.951-.58 1.684-1.5 2.029-2.596-.894.534-1.885.922-2.945 1.13-.846-.902-2.052-1.467-3.393-1.467-2.565 0-4.647 2.082-4.647 4.646 0 .364.042.718.122 1.059-3.864-.194-7.288-2.045-9.579-4.868-.4.687-.631 1.488-.631 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.481-.234-2.106-.583v.058c0 2.259 1.605 4.137 3.737 4.567-.392.107-.805.163-1.229.163-.3 0-.593-.028-.879-.082.593 1.85 2.313 3.198 4.352 3.234-1.593 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.114-.065 2.062 1.323 4.505 2.092 7.14 2.092 8.568 0 13.255-7.098 13.255-13.254 0-.2-.004-.401-.012-.601.911-.658 1.7-1.479 2.324-2.418z"
                        />
                    </svg>
                    </a>
                </div>
            </footer>
        </div>
    );
};
 
export default Home;