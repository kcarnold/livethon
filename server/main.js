import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ModulesCollection } from '/imports/api/modules';

// Placeholder for actual login credentials
// All passwords are "password"
export const INSTRUCTOR = "instructor";
const STUDENTS = [
  "Jacob",
  "Andrew",
  "Josh",
]

Meteor.startup(() => {

  [...STUDENTS, INSTRUCTOR].forEach((name) => {
    if (!Accounts.findUserByUsername(name)) {
      Accounts.createUser({
        username: name,
        password: "password",
      });
    }
  });

});
