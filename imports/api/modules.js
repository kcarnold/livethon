import { Mongo } from 'meteor/mongo';

export const ModulesCollection = new Mongo.Collection('modules');
export const RunsCollection = new Mongo.Collection('runs')
