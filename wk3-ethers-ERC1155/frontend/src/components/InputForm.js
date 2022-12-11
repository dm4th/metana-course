import React from 'react';

export const InputForm = (props) => (
  <form className="input-form">
    <label>
      {props.label}
      <select className="selector" onChange={props.handleChange} defaultValue="Select Token ID">
        <option key="" value="">
          Select Token ID
        </option>
        {props.inputs.map((input) =>
          <option key={input} value={input}>
            {input}
          </option>
        )}
      </select>
    </label>
  </form>
);