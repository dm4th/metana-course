import React from 'react';

export const InputButton = (props) => (
    <button onClick={() => props.handleClick(props.inputValue)} className={props.className}>
        {props.label}
    </button>
);

export const InputButton2 = (props) => (
    <button onClick={() => props.handleClick(props.inputValue, props.outputValue)} className={props.className}>
        {props.label}
    </button>
);