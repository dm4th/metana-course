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


export const ClearWalletsPopup = ({ clearHandler }) => {
    return ReactDom.createPortal(
        <div className="popup-container">
            <div className="popup">
                <h2>Clear Wallets Memory</h2>
                <p className="message">Continuing will wipe local memory of stored walelts & associated passwords</p>
                <p className="message warning">THIS CANNOT BE UNDONE</p>
                <p className="message">You will be ale to recover your wallet using your seed phrase later</p>
                <div className="popup-button-grouping">
                    <button className="cta-button submit-button" onClick={() => clearHandler(true)}>
                    Continue
                    </button>
                    <button className="cta-button cancel-button" onClick={() => clearHandler(false)}>
                    Cancel
                    </button>
                </div>
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



export const PasswordAskPopup = ({ onSubmit, errorFlag, progress }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e.target[0].value);
    }

    const handleCancel = () => {
        onSubmit(null);
    }

    const errorBlock = () => {
        return (
            <p className="input-error">Incorrect Password</p>
        )
    }

    const progressBlock = () => {
        return (
            <p className="password-progress">Decrypting -- {Math.round(progress*100)}%</p>
        )
    }

    return ReactDom.createPortal(
        <div className="popup-container">
            <div className="popup">
                <h2>Enter Password</h2>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="popup-form-group">
                        <label htmlFor="password" className="popup-form-control">Password:</label>
                        <br></br>
                        <input type="password" className="popup-form-control" id="password-capture" placeholder="Password" />
                        <br></br>
                        <div className="popup-button-grouping">
                            <button className="popup-form-control submit-button" type="submit">
                            Submit
                            </button>
                            <button className="popup-form-control cancel-button" type="button" onClick={handleCancel}>
                            Cancel
                            </button>
                        </div>
                    </div>
                </form>
                <div className="password-message-div">
                    {errorFlag ? errorBlock() : null}
                    {progress ? progressBlock() : null}
                </div>
            </div>
        </div>,
    document.getElementById("password-ask-popup")
    );
};

export const SeedAskPopup = ({ onSubmit, errorFlag, dupeFlag }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e.target[0].value);
    }

    const handleCancel = () => {
        onSubmit(null);
    }

    const errorBlock = () => {
        return (
            <p className="input-error">Invalid Seed Phrase</p>
        )
    }

    const dupeBlock = () => {
        return (
            <p className="input-error">Wallet Already Imported</p>
        )
    }

    return ReactDom.createPortal(
        <div className="popup-container">
            <div className="popup">
                <h2>Enter Seed Phrase</h2>
                <p className="message">Enter the Seed Phrase you were given when you created your wallet</p>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="popup-form-group">
                        <div>
                            <textarea rows="3" cols="50" className="popup-form-control seed-input" id="seed-capture" />
                        </div>
                        <div className="popup-button-grouping">
                            <button className="popup-form-control submit-button" type="submit">
                            Submit
                            </button>
                            <button className="popup-form-control cancel-button" type="button" onClick={handleCancel}>
                            Cancel
                            </button>
                        </div>
                    </div>
                </form>
                <div className="password-message-div">
                    {errorFlag ? errorBlock() : null}
                    {dupeFlag ? dupeBlock() : null}
                </div>
            </div>
        </div>,
    document.getElementById("seed-ask-popup")
    );
};