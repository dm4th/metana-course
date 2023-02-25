import React from 'react';

class PairInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _pair: this.props.initialPair,
            _rounds: this.props.initialRounds,
        };

        this.handlePairChange = this.handlePairChange.bind(this);
        this.handleRoundsChange = this.handleRoundsChange.bind(this);
        this.handlePairSubmit = this.handlePairSubmit.bind(this);
        this.handleRoundsSubmit = this.handleRoundsSubmit.bind(this);
    };

    async handlePairChange(event) {
        await this.setState({
            _pair: event.target.value,
            _rounds: this.state._rounds
        });
    }

    async handleRoundsChange(event) {
        await this.setState({
            _pair: this.state.pair,
            _rounds: event.target.value
        });
    }

    handlePairSubmit(event) {
        event.preventDefault();
        this.props.onPairChange(this.state._pair);
    }

    handleRoundsSubmit(event) {
        event.preventDefault();
        this.props.onRoundsChange(this.state._rounds);
    }

    render () {
        return (
            <div className="input-div">
                <form className='input-form' onSubmit={this.handlePairSubmit}>
                    <label htmlFor="pair-input" className='input-label'>
                        Trading Pair to View:  
                    </label>
                    <select className="selector input-field" name="pair-input" onChange={this.handlePairChange} defaultValue={this.props.initialPair} >
                        {Object.keys(this.props.selections).map((k, i) => 
                            <option key={i} value={k}>
                                {k}
                            </option>
                        )}
                    </select>
                    <input type="submit" value="Submit" />
                </form>
                <form className='input-form' onSubmit={this.handleRoundsSubmit}>
                    <label htmlFor="rounds-input" className='input-label'>
                        Historical Rounds to View:  
                    </label>
                    <input className="number input-field" id="rounds-input" type="number" onChange={this.handleRoundsChange} defaultValue={this.props.initialRounds} min="1" max="20" />
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

export default PairInput;