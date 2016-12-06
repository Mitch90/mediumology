//set up the startingpoint and depth of the crawl
var initialTopic = 'Privacy',
    depth = 2;

//get dependencies
var request = require('request'),
    fs = require('fs'),
    _ = require('underscore');

//set dictionary, counters variables, tsv headers
var topics = [],
    startingPoint = initialTopic.toLowerCase().replace(' ', '-'),
    degreeCounter = 1,
    indexCounter = -1,
    initialTopicInfo = false,
    edgesHeader = 'source\ttarget\n',
    nodesHeader = 'id\ttagDegree\tfollowerCount\tpostCount\n';

//get date and create new folder
var d = new Date(),
    date = d.toISOString(),
    newFolder = startingPoint + "_" + date.substring(0, 10) + '(' + date.substring(11, 13) + '-' + date.substring(14, 16) + '-' + date.substring(17, 19) + ')';

fs.mkdirSync(newFolder);

//create edges tsv file
fs.writeFileSync(newFolder + '/' + startingPoint + '_edges.tsv', edgesHeader);
//create nodes tsv file
fs.writeFileSync(newFolder + '/' + startingPoint + '_nodes.tsv', nodesHeader);

//call the API
function callAPI(tag) {
    var currentTopic = tag.topic;
    console.log('retrieving ' + tag.topic + '\'s related tags…');

    //make API call
    request('https://medium.com/_/api/tags/' + tag.slug + '/related', function(error, response, body) {
        console.log('Status Code: ' + response.statusCode);
        if (!error && response.statusCode == 200) {
            //get the JSON from page
            var re = /^.*x>/,
                cleanUp = JSON.parse(body.replace(re, ''));

            var tagJson = cleanUp.payload.relatedTags;
            console.log('Got ' + tagJson.length + ' tags.');

            _.each(tagJson, function(tagObject) {
                //check if the topic is already in the dictionary
                var match = _.findIndex(topics, {
                    topic: tagObject.name
                });
                if (match === -1) {
                    //check if the tag is the startingPoint (the first time it happens)
                    if (tagObject.slug === 'privacy') {
                        //make sure the starting node is added only once
                        if (!initialTopicInfo) {
                            //update the node tsv
                            fs.appendFileSync(newFolder + '/' + startingPoint + '_nodes.tsv', tagObject.name + '\t' + 0 + '\t' + tagObject.metadata.followerCount + '\t' + tagObject.postCount + '\n');
                            initialTopicInfo = !initialTopicInfo;
                        }
                    } else {
                        //if the topic wasn't present n the dictionary, add it
                        topics.push({
                            topic: tagObject.name,
                            degree: degreeCounter,
                            followerCount: tagObject.metadata.followerCount,
                            postCount: tagObject.postCount,
                            slug: tagObject.slug
                        });
                        console.log('New topic found! Added ' + tagObject.name + ' to dictionary.');
                        //update the node tsv
                        fs.appendFileSync(newFolder + '/' + startingPoint + '_nodes.tsv', _.last(topics).topic + '\t' + _.last(topics).degree + '\t' + _.last(topics).followerCount + '\t' + _.last(topics).postCount + '\n');
                    }
                }
                //update edges tsv with new found connections
                var newEdgeLine = currentTopic + '\t' + tagObject.name + '\n';
                fs.appendFileSync(newFolder + '/' + startingPoint + '_edges.tsv', newEdgeLine);
            });

            console.log('All ' + tagJson.length + ' tags scraped.');
            //update counter to get the right node from the topics' list
            indexCounter++;
            //update counter to give the right degrees to every node
            if (topics[indexCounter].degree === degreeCounter) {
                degreeCounter++;
            }
            //check if the search is going beyond the predefined depth
            if (degreeCounter < depth + 1) {
                console.log('\nMoving on…');
                //call API again with new tag
                callAPI({topic: topics[indexCounter].topic, slug: topics[indexCounter].slug});
            } else {
                console.log('\nDone! All the tags related to ' + initialTopic + ' have been scraped, until depth ' + depth);
            }

        }
    });
}

callAPI({
    topic: initialTopic,
    slug: startingPoint
});
