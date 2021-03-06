/* Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: gdennis@google.com (Greg Dennis)
 */

goog.require('goog.testing.jsunit');
goog.require('puppet.params');


function testSetUrlParamWithNoSpecialChars() {
  var url = puppet.params.setUrlParam('q', 'widgets',
      'http://www.google.com/search?hl=en');
  assertEquals('http://www.google.com/search?hl=en&q=widgets', url);
}

function testSetUrlParamWithSlashQuestionMarkCommaAndColonInValue() {
  var url = puppet.params.setUrlParam('q', '/?:,',
      'http://www.google.com/search?hl=en');
  assertEquals('http://www.google.com/search?hl=en&q=/?:,', url);
}

function testSetUrlParamWithSlashQuestionMarkCommaAndColonInQuery() {
  var url = puppet.params.setUrlParam('hl', 'en',
      'http://www.google.com/search?q=/?:,');
  assertEquals('http://www.google.com/search?q=/?:,&hl=en', url);
}

function testSetUrlParamWithAmpersandAndEqualsInValue() {
  var url = puppet.params.setUrlParam('q', '&=',
      'http://www.google.com/search?hl=en');
  assertEquals('http://www.google.com/search?hl=en&q=%26%3D', url);
}

function testSetUrlParamWithEscapedAmpersandAndEqualsInValue() {
  var url = puppet.params.setUrlParam('q', '%26%3D',
      'http://www.google.com/search?hl=en');
  assertEquals('http://www.google.com/search?hl=en&q=%26%3D', url);
}

function testSetUrlParamWithEscapedAmpersandAndEqualsInQuery() {
  var url = puppet.params.setUrlParam('hl', 'en',
      'http://www.google.com/search?q=%26%3D');
  assertEquals('http://www.google.com/search?q=%26%3D&hl=en', url);
}

function testSetUrlParamWithEscapedPercentInValue() {
  var url = puppet.params.setUrlParam('q', '%25',
      'http://www.google.com/search?hl=en');
  assertEquals('http://www.google.com/search?hl=en&q=%25', url);
}

function testSetUrlParamWithEscapedPercentInQuery() {
  var url = puppet.params.setUrlParam('hl', 'en',
      'http://www.google.com/search?q=%25');
  assertEquals('http://www.google.com/search?q=%25&hl=en', url);
}

/**
 * @suppress {visibility}
 */
function testGetAllAndGetUndeclared() {
  puppet.params.windowUrl_ = function() {
    return 'http://www.google.com/search?a=x&c=y&b&d';
  };
  puppet.params.declareString('a', '');
  puppet.params.declareBoolean('b');
  assertObjectEquals({a: 'x', b: '', c: 'y', d: ''}, puppet.params.getAll());
  assertObjectEquals({c: 'y', d: ''}, puppet.params.getUndeclared());
}
