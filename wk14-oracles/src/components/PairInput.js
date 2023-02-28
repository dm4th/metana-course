import React from 'react';

class PairInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _pair1: this.props.initialPair1,
            _pair2: this.props.initialPair2,
            _rounds: this.props.initialRounds,
            _axis: this.props.initialAxis
        };

        this.handlePair1Change = this.handlePair1Change.bind(this);
        this.handlePair2Change = this.handlePair2Change.bind(this);
        this.handleRoundsChange = this.handleRoundsChange.bind(this);
        this.handleAxisChange = this.handleAxisChange.bind(this);
        this.handleRoundsSubmit = this.handleRoundsSubmit.bind(this);
    };

    async handlePair1Change(event) {
        await this.setState({
            _pair1: event.target.value,
            _pair2: this.state._pair2,
            _rounds: this.state._rounds,
            _axis: this.state._axis
        });
        this.props.onPair1Change(this.state._pair1);
    }

    async handlePair2Change(event) {
        await this.setState({
            _pair1: this.state._pair1,
            _pair2: event.target.value,
            _rounds: this.state._rounds,
            _axis: this.state._axis
        });
        this.props.onPair2Change(this.state._pair2);
    }

    async handleRoundsChange(event) {
        await this.setState({
            _pair1: this.state._pair1,
            _pair2: this.state._pair2,
            _rounds: event.target.value,
            _axis: this.state._axis
        });
    }

    async handleAxisChange(event) {
        await this.setState({
            _pair1: this.state._pair1,
            _pair2: this.state._pair2,
            _rounds: this.state._rounds,
            _axis: event.target.value
        });
        this.props.onAxisChange(this.state._axis);
    }

    handleRoundsSubmit(event) {
        event.preventDefault();
        this.props.onRoundsChange(this.state._rounds);
    }

    render () {
        return (
            <div className="input-div">
                <form className='input-form'>
                    <label htmlFor="pair1-input" className='input-label'>
                        Trading Pair to View  
                    </label>
                    <select className="selector input-field" name="pair1-input" onChange={this.handlePair1Change} defaultValue={this.props.initialPair1} >
                        {Object.keys(this.props.selections).map((k, i) => 
                            <option key={i} value={k}>
                                {k}
                            </option>
                        )}
                    </select>
                </form>
                <form className='input-form'>
                    <label htmlFor="pair2-input" className='input-label'>
                        Comparison Trading Pair  
                    </label>
                    <select className="selector input-field" name="pair2-input" onChange={this.handlePair2Change} defaultValue={this.props.initialPair2} >
                        {Object.keys(this.props.selections).map((k, i) => 
                            <option key={i} value={k}>
                                {k}
                            </option>
                        )}
                    </select>
                </form>
                <form className='input-form' onSubmit={this.handleRoundsSubmit}>
                    <label htmlFor='rounds' className='input-label'>
                        Oracle Rounds to View
                    </label>
                    <div className='number-input-div'>
                        <input className='input-field' type='number' id='rounds' name='rounds' min='1' max='1000' defaultValue={this.props.initialRounds} onChange={this.handleRoundsChange} />
                        <input className='submit-button' type='submit' value="Submit" />
                    </div>
                </form>
                <form className='input-form radio-form'>
                    {this.props.axisSelections.map((n) => 
                        <div className='radio-selection' key={n}>
                            <input className='radio-input' type='radio' id={n} name='True' value={n} checked={this.state._axis === n} onChange={this.handleAxisChange} />
                            <label className='radio-label' htmlFor={n}>{n}</label>
                        </div>
                    )}
                </form>
            </div>
        )
    }
}

export default PairInput;