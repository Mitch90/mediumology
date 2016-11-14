//set starting topic to investigate and search depth
var startingPoint = 'privacy',
    depth = 3;

//import dependencies
var fs = require('fs'),
    _ = require('underscore'),
    Nightmare = require('nightmare'),
    nightmare = Nightmare({
        show: true
    });

//set dictionary, counters variables, tsv headers
var topics = [],
    degreeCounter = 1,
    indexCounter = 0,
    edgesHeader = 'source\ttarget\n',
    nodesHeader = 'id\ttagDegree\n';

//start creating dictionary
topics.push({topic: startingPoint, degree: 0});
//create edges tsv file
fs.writeFileSync(startingPoint + '_edges.tsv', edgesHeader);
//create nodes tsv file and append the starting node
fs.writeFileSync(startingPoint + '_nodes.tsv', nodesHeader);
fs.appendFileSync(startingPoint + '_nodes.tsv', topics[0].topic + '\t' + topics[0].degree + '\n');

//scrape related tags from Medium pages
function getTagsFromPages (newTopic) {
    var newPage = newTopic.replace(' ', '-');
    console.log('going to https://medium.com/tag/' + newPage + ", degree: " + topics[indexCounter].degree);

    nightmare
        .goto('https://medium.com/tag/' + newPage)
        .wait('.tags')
        .evaluate(function () {
            //get all the related tags
            var nodeList = document.querySelectorAll('.tags .link'),
                relatedList = [];

            nodeList.forEach(function (node) {
                relatedList.push(node.innerText.toLowerCase());
            });

            return relatedList;
        })
        .then(function (list) {
            addLinesToTsv(list);
        });
};

//the function adds all the connections found to the edges and nodes tsv
function addLinesToTsv (list) {
    console.log('scraping tags…');
    list.forEach(function (element) {
        //check if the topic is already in the dictionary
        var match = _.findIndex(topics, {topic: element});
        if (match === -1) {
            //if not add it and update the nodes tsv
            topics.push({topic: element, degree: degreeCounter});
            fs.appendFileSync(startingPoint + '_nodes.tsv', _.last(topics).topic + '\t' + _.last(topics).degree + '\n');
        }
        //update edges tsv with new found connections
        var newEdgeLine = topics[indexCounter].topic + '\t' + element + '\n';
        fs.appendFileSync(startingPoint + '_edges.tsv', newEdgeLine);
    });
    console.log(topics[indexCounter].topic + '\'s related tags scraped.');
    //update counter to get the right node from the topics' list
    indexCounter++;
    //update counter to give the right degrees to every node
    if (topics[indexCounter].degree === degreeCounter) {
        degreeCounter++;
    }
    //check if the search is going beyond the predefined depth
    if (degreeCounter <= depth + 1) {
        //go to new Medium page
        getTagsFromPages(topics[indexCounter].topic);
    } else {
        //close Electron
        nightmare
            .evaluate()
            .end()
            .then();

        console.log('Done!');
    }
};

//start scraping
getTagsFromPages(startingPoint);
