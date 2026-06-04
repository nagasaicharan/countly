/**
 *  Modifies all member emails and where these emails are used to lowercase
 *  Server: userovo
 *  Path: userovo dir/bin/scripts/convert_member_emails_to_lowercase.js
 *  Command: convert_member_emails_to_lowercase.js
 */

var pluginManager = require('../../../../plugins/pluginManager');
var Promise = require("bluebird");

function updateCohortSharedEmails(db) {
    return new Promise((resolve, reject) => {
        db.collection("cohorts").update(
            { shared_email_edit: { $ne: null } },
            [
                {
                    $set: {
                        shared_email_edit: {
                            $map: {
                                input: "$shared_email_edit",
                                in: { $toLower: "$$this" }
                            }
                        }
                    }
                }
            ],
            { multi: true },
            (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
    });
}

function updateNotesSharedEmails(db) {
    return new Promise((resolve, reject) => {
        db.collection("notes").update(
            { emails: { $ne: null } },
            [
                {
                    $set: {
                        emails: {
                            $map: {
                                input: "$emails",
                                in: { $toLower: "$$this" }
                            }
                        }
                    }
                }
            ],
            { multi: true },
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

function updateDashboardSharedEmails(db) {
    return new Promise((resolve, reject) => {
        db.collection("dashboards").update(
            {},
            [
                {
                    $set: {
                        shared_email_edit: {
                            $map: {
                                input: "$shared_email_edit",
                                in: { $toLower: "$$this" }
                            }
                        },
                        shared_email_view: {
                            $map: {
                                input: "$shared_email_view",
                                in: { $toLower: "$$this" }
                            }
                        }
                    }
                }
            ],
            { multi: true },
            (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
    });
}

function updateMemberEmails(db) {
    return new Promise((resolve, reject) => {
        db.collection("members").update(
            { email: { $ne: null } },
            [{
                $set: {
                    lower_email: {
                    $toLower: "$email"
                    }
                }
            }],
            { multi: true },
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
    });
}

function updateReportEmails(db) {
    return new Promise((resolve, reject) => {
        db.collection("reports").update(
            { emails: { $ne: null } },
            [
                {
                    $set: {
                        emails: {
                            $map: {
                                input: "$emails",
                                in: { $toLower: "$$this" }
                            }
                        }
                    }
                }
            ],
            { multi: true },
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

async function context() {
    const userovoDb = await pluginManager.dbConnection("userovo");

    try {
        await updateCohortSharedEmails(userovoDb);
        console.log("Cohorts update successful.");
    }
    catch (err) {
        console.error("Error updating cohorts:", err);
    }

    try {
        await updateNotesSharedEmails(userovoDb);
        console.log("Notes update successful.");
    }
    catch (err) {
        console.error("Error updating notes:", err);
    }

    try {
        await updateDashboardSharedEmails(userovoDb);
        console.log("Dashboards update successful.");
    }
    catch (err) {
        console.error("Error updating dashboards:", err);
    }

    try {
        await updateMemberEmails(userovoDb);
        console.log("Members update successful.");
    }
    catch (err) {
        console.error("Error updating dashboards:", err);
    }

    try {
        await updateReportEmails(userovoDb);
        console.log("Reports update successful.");
    }
    catch (err) {
        console.error("Error updating dashboards:", err);
    }

    userovoDb.close();
    console.log("All done!");
}


context();