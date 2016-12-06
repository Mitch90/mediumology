# mediumology
This tool will help you create a network of related tags on Medium, starting from a given topic. The output are two tsv files (one for the nodes and one for the edges) that can be later used in softwares such as Gephi.

###To run mediumology:

* Make sure you have [Node](https://nodejs.org/en/) installed

* Clone the repository

* Go to the mediumology folder
```
cd pathToTheMediumologyFolder
```

* Install node modules
```
npm install
```

* Open **index.js** and choose the topic to analyze and the depth of the search (it must be an existing tag on Medium obviously)
```javascript
var initialTopic = 'Privacy',
    depth = 2;
```

* Run the script
```
node index.js
```
