import React from 'react';

class PairInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _pair1: this.props.initialPair1,
            _pair2: this.props.initialPair2,
            _time: this.props.initialTime,
            _axis: this.props.initialAxis
        };

        this.handlePair1Change = this.handlePair1Change.bind(this);
        this.handlePair2Change = this.handlePair2Change.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handleAxisChange = this.handleAxisChange.bind(this);
        this.handlePair1Submit = this.handlePair1Submit.bind(this);
        this.handlePair2Submit = this.handlePair2Submit.bind(this);
        // this.handleTimeSubmit = this.handleTimeSubmit.bind(this);
    };

    async handlePair1Change(event) {
        await this.setState({
            _pair1: event.target.value,
            _pair2: this.state._pair2,
            _time: this.state._time,
            _axis: this.state._axis
        });
    }

    async handlePair2Change(event) {
        await this.setState({
            _pair1: this.state._pair1,
            _pair2: event.target.value,
            _time: this.state._time,
            _axis: this.state._axis
        });
    }

    async handleTimeChange(event) {
        await this.setState({
            _pair1: this.state._pair1,
            _pair2: this.state._pair2,
            _time: event.target.value,
            _axis: this.state._axis
        });
        this.props.onTimeChange(this.state._time);
    }

    async handleAxisChange(event) {
        await this.setState({
            _pair1: this.state._pair1,
            _pair2: this.state._pair2,
            _time: this.state._time,
            _axis: event.target.value
        });
        this.props.onAxisChange(this.state._axis);
        console.log(this.state);
    }

    handlePair1Submit(event) {
        event.preventDefault();
        this.props.onPair1Change(this.state._pair1);
    }

    handlePair2Submit(event) {
        event.preventDefault();
        this.props.onPair2Change(this.state._pair2);
    }

    // handleTimeSubmit(event) {
    //     event.preventDefault();
    //     this.props.onTimeChange(this.state._time);
    // }

    render () {
        return (
            <div className="input-div">
                <form className='input-form' onSubmit={this.handlePair1Submit}>
                    <label htmlFor="pair1-input" className='input-label'>
                        Trading Pair to View:  
                    </label>
                    <select className="selector input-field" name="pair1-input" onChange={this.handlePair1Change} defaultValue={this.props.initialPair1} >
                        {Object.keys(this.props.selections).map((k, i) => 
                            <option key={i} value={k}>
                                {k}
                            </option>
                        )}
                    </select>
                    <input type="submit" value="Submit" />
                </form>
                <form className='input-form' onSubmit={this.handlePair2Submit}>
                    <label htmlFor="pair2-input" className='input-label'>
                        Comparison Trading Pair:  
                    </label>
                    <select className="selector input-field" name="pair2-input" onChange={this.handlePair2Change} defaultValue={this.props.initialPair2} >
                        {Object.keys(this.props.selections).map((k, i) => 
                            <option key={i} value={k}>
                                {k}
                            </option>
                        )}
                    </select>
                    <input type="submit" value="Submit" />
                </form>
                <form className='input-form radio-form'>
                    {Object.keys(this.props.timeSelections).map((k, i) => 
                        <div className='radio-selection' key={k}>
                            <input type='radio' id={i} name={k} value={k} checked={this.state._time === k} onChange={this.handleTimeChange} />
                            <label htmlFor={i}>{k}</label>
                        </div>
                    )}
                </form>
                <form className='input-form radio-form'>
                    {this.props.axisSelections.map((n) => 
                        <div className='radio-selection'>
                            <input type='radio' id={n} name='True' value={n} checked={this.state._axis === n} onChange={this.handleAxisChange} />
                            <label htmlFor={n}>{n}</label>
                        </div>
                    )}
                </form>
            </div>
        )
    }
}

export default PairInput;