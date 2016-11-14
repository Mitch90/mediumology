# mediumology
This tool will help you create a network of related tags on Medium, starting from a given topic. The output are two tsv files (one for the nodes and one for the edges) that can be later used in softwares such as Gephi.
To run mediumology:
1. Make sure you have [Node](https://nodejs.org/en/) installed
2. Clone the repository
3. Go to the mediumology folder
    '''cd *path to the mediumology folder*'''
4. Install node modules
    '''npm install'''
5. Open **index.js** and choose the topic to analyze and the depth of the search
```javascript
    var startingPoint = 'privacy',
        depth = 3;
```
6. Run the script
    '''node index.js'''
