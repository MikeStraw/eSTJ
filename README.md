Home for an *electronic stroke and turn judging* (eSTJ) application for swim meets run with Hy-Tek's Meet Manager software.  Sister project, *mm_to_json*,  converts the Meet Manager database to a json file.  

The *eSTJ* server pushes the json data into a MongoDB database and provides an API to access that swim meet data.  The *eSTJ* client displays the meet's entries (think heat sheet) to the stroke and turn official allowing  them to record disqualifications.  With each DQ, a message is sent to the
 *eSTJ* server, which informs the meet referee and the Meet Manager operator.

In addition, the *eSTJ* server can watch for changes to the meet json file produced by *mm_to_json* and provide updated entry information to the *eSTJ* client.  This updated information could be the swim times from a completed event, updated athlete scratch information or the official disqualification approved by the referee.