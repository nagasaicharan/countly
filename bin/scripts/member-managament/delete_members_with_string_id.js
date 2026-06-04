/*
Script should be placed in ./bin/scripts/member-managament/delete_members_with_string_id.js

Script is used to delete user(s) by email, as they have invalid id (string id).
It can also delete all members with invalid id (string id) (if DELETE_ALL_INVALID_ID_USERS is set to true)
*/

var pluginManager = require('../../../plugins/pluginManager.js');

const dry_run = false; //if set true, there will be only information outputted about users like that, but deletion will not be triggered.
const DELETE_ALL_INVALID_ID_USERS = false; //if set true, all users with invalid string id will be deleted
//const EMAILS = ["test@mail.com", "test2@mail.com"];
const EMAILS = []; //if DELETE_ALL_INVALID_ID_USERS is set to false, this array should contain emails of users to be deleted

if (dry_run) {
    console.log("This is a dry run");
    console.log("Members will only be listed, not deleted");
}

pluginManager.dbConnection().then(async(userovoDb) => {
    try {
        // Find the invalid id users
        let invalidUsers = [];
        if (DELETE_ALL_INVALID_ID_USERS) {
            invalidUsers = await getallInvalidIdUsers(userovoDb);
        }
        else {
            invalidUsers = await getallInvalidIdUsers(userovoDb, EMAILS);
        }
        console.log(`The following ${invalidUsers.length} user(s) will be deleted: `);
        console.log(JSON.stringify(invalidUsers));
        if (!dry_run) {
            await Promise.all(invalidUsers.map(async(user) => {
                let userId = user._id;
                let email = user.email;
                let promises = [];
                //auth tokens
                promises.push(userovoDb.collection('auth_tokens').remove({ 'owner': userId }));
                //user notes
                promises.push(userovoDb.collection('notes').remove({ 'owner': userId, }));
                //dashboard
                promises.push(userovoDb.collection('dashboards').update({}, { $pull: { shared_email_edit: email, shared_email_view: email } }, { multi: true }));
                //reports
                promises.push(userovoDb.collection("reports").remove({user: userId}, { multi: true }));
                //groups
                promises.push(userovoDb.collection("groups").update({}, { $pull: { users: userId}}, { multi: true }));
                await Promise.all(promises);
                await userovoDb.collection('members').remove({ '_id': userId });
                console.log("User deleted: ", JSON.stringify(user));
            }));
            console.log("All done");
        }
    }
    catch (error) {
        console.log("ERROR: ");
        console.log(error);
        userovoDb.close();
    }
    finally {
        userovoDb.close();
    }
});

function getallInvalidIdUsers(db, emails) {
    const query = {
        _id: {
            $type: 2 //"string" alias
        }
    };
    if (emails?.length) {
        query.email = {
            $in: emails
        };
    }
    return db.collection('members').find(query, {
        projection: { _id: 1, email: 1 }
    }).toArray();
}