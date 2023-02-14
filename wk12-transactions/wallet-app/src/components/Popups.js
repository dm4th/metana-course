import React from "react";
import ReactDom from "react-dom";

export const MnemonicPopup = ({ phrase, showSeed }) => {
    return ReactDom.createPortal(
        <div className="popup-container">
            <div className="popup">
                <h2>Mnemonic Seed Phrase</h2>
                <p className="message">Please store this phrase somewhere safe before continuing.</p>
                <p className="message">You will be able to recover your wallet with this phrase if you lose your password.</p>
                <p className="seed-phrase">{phrase}</p>
                <button className='cta-button seed-phrase-button' onClick={() => showSeed('', false)}>Continue</button>
            </div>
        </div>,
    document.getElementById("seed-phrase-popup")
    );
};

export const PasswordCapturePopup = ({ onSubmit }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e.target[0].value);
    }

    return ReactDom.createPortal(
        <div className="popup-container">
            <div className="popup">
                <h2>Create a Password</h2>
                <p className="message">Enter a password for your wallet so you can login easier with this wallet later</p>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="popup-form-group">
                        <label htmlFor="password" className="popup-form-control">Password:</label>
                        <br></br>
                        <input type="password" className="popup-form-control" id="password-capture" placeholder="Password" />
                        <br></br>
                        <button className="popup-form-control submit-button" type="submit">
                        Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>,
    document.getElementById("password-capture-popup")
    );
};