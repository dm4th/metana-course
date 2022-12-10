import React from 'react';

export const InputButton = (props) => (
    <button onClick={() => props.handleClick(props.inputValue)} className={props.className}>
        {props.label}
    </button>
);