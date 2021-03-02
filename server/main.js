import { Meteor } from 'meteor/meteor';
import { ModulesCollection } from '/imports/api/modules';

function insertModule({ filename, contents }) {
  ModulesCollection.insert({filename, contents, createdAt: new Date()});
}

Meteor.startup(() => {
  // If the Links collection is empty, add some data.
  if (ModulesCollection.find().count() === 0) {
    insertModule({
      filename: "test.py",
      contents: "print('Hello, world!')"
    });
  }
});
