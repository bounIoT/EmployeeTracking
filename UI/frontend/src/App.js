import React from 'react';
import Header from './Header.js';
import './App.css';
import io from 'socket.io-client';

class Square extends React.Component {
  render() {
    if(this.props.value===this.props.chosen){
      return (
        <div  className="squareC">
        Zone {this.props.value}     
        </div>
      );
    }
    else{
      return (
        <div className="square">
        Zone {this.props.value}     
        </div>
      );
    }
  }
}

class Board extends React.Component {

  renderSquare(i) {
    return <Square key={i} value={i} chosen={this.props.chosen} />;
  }

  renderSquares(nr_squares, offset) {
    const squares = [];
    for(let i = 0; i < nr_squares; i++) {
      squares.push(this.renderSquare(offset + i));
    }
    return squares;
  }

  renderRow(idx, nr_squares) {
    return <div key={idx} className="board-row">
        {this.renderSquares(nr_squares, idx * nr_squares + 1)}
    </div>
  }

  renderRows(nr_rows, nr_cols) {
    const rows = [];
    for(let i = 0; i < nr_rows; i++) {
      rows.push(this.renderRow(i, nr_cols));
    }
    return rows;
  }
  
  render() {
    return (
      <div>
        {this.renderRows(this.props.rows, this.props.cols)}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mac: undefined,
      location: -1,
    }
  }

  componentDidMount() {
    this.socket = io("http://142.93.38.166:9696");

    this.socket.on("location", ({ mac, location }) => {
      this.setState({
        mac: mac,
        location: location,
      });
    });
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board rows={4} cols={3} chosen={this.state.location} />
        </div>
        <div className="macList">
        <p>
          Tracked Mobile Device MACs
        </p>
          <SimpleList list={mylist} />
        </div>
      </div>
    );
  }
}
const mylist = [ {mac: '01:02:03:04:05', tracked: true}, {mac:'06:07:08:09:0a', tracked: false}];


const SimpleList = ({ list }) => (
  <ul>
    {list.map(item => (
      <li className={item.tracked ? "listItem1" : ""} key={item}>
        <span>{item.mac}</span>
      </li>
    ))}
  </ul>
);

function App() {
  return (
    <div className="App">
      <Header />
      <div classname="sMap">
        <Game chosen={3} />
      </div>
    </div>
  );
}

export default App;

