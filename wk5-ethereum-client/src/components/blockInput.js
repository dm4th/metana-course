import React from 'react';

class BlockInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _blocks: this.props.maxBlocks
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    handleChange(event) {
        this.setState({
            _blocks: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onBlocksChange(this.state._blocks);
    }

    render () {
        return (
            <div className="input-div">
                <form className='input-form' onSubmit={this.handleSubmit}>
                    <label className='input-label'>
                        Historical Blocks to View:  
                        <input className="input-field" type="text" value={this.state._blocks} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

export default BlockInput;
