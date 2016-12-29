import Snippets from './Snippets';
import React from 'react';

const Snippetslist = React.createClass({
  handleClick() {
    this.props.displaySearch();
  },

  handleSortType(event) {
    const sortValue = event.target.name;

    this.props.handleSort(sortValue);
  },

  render() {
    // if (renderByLanguage) {
    //   const snippetmap = this.props.snippets.map((snippetLanguage, index) => {
    //     return this.props.snippets.language
    //   })
    // }
    const snippetmap = this.props.snippets.map((snippetTitle, index) => {
      return <Snippets
        key={index}
        value={index}
        snippetTitle={this.props.snippets[index].title}
        currentIndex={this.props.currentIndex}
        changeCurrentIndex={this.props.changeCurrentIndex}
        // value={this.state.snippets[index].title}
      />
    });

    return (
      <div>
        <p></p>
        <ul>
            { snippetmap }

            {/* <Snippets
              snippets={this.props.snippets}
              snippetTitles={this.props.snippetTitles}
            /> */}
        </ul>
      </div>
    );
  }
});

export default Snippetslist;
