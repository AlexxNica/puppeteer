/*
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: gdennis@google.com (Greg Dennis)
 */

/**
 * @fileoverview Disable type checks because of the use of Mocks.
 * @suppress {checkTypes}
 */

goog.require('goog.dom');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('puppet.State');
goog.require('puppet.elements');


var elem, mockControl, mockWindow, mockNodeset;
var recordedElems, recordedLocators;
var state;

var Nodeset = function() {};
Nodeset.prototype.iterateNext = function() {};

puppet.elements.addListener(function(result, locator) {
  recordedElems.push(result);
  recordedLocators.push(locator);
});

function setUp() {
  mockControl = new goog.testing.MockControl();
  mockWindow = mockControl.createStrictMock(window);
  mockNodeset = mockControl.createStrictMock(Nodeset);
  state = new puppet.State(false);
  puppet.xpath.resolveXPath = mockControl.createFunctionMock();
  puppet.logging.error = mockControl.createFunctionMock();
  puppet.elements.clearCache();
  recordedElems = [];
  recordedLocators = [];
  elem = goog.dom.getRequiredElement('flash');
  elem.removeAttribute('style');
}

function funcElem() {
  return [elem];
}

function funcNoElem() {
  return [];
}

function funcReturnsArray() {
  return [elem, document.body];
}

function testGetIsIdentifyFunctionWhenArgumentIsElement() {
  var result = callGetAndVerifyMocks(elem);
  assertEquals(elem, result);
  assertEquals(elem, recordedElems[0]);
  assertEquals(elem, recordedLocators[0]);
}

function testGetWhenArgumentIsFunctionReturningElement() {
  var result = callGetAndVerifyMocks(funcElem);
  assertEquals(elem, result);
  assertEquals(elem, recordedElems[0]);
  assertEquals(funcElem, recordedLocators[0]);
}

function testGetReturnsNullWhenXPathResolvesToNoElements() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(null);
  var result = callGetAndVerifyMocks('xpath');
  assertEquals(null, result);
  assertEquals(0, recordedElems.length);
  assertEquals(0, recordedLocators.length);
}

function testGetWhenArgumentIsFunctionResolvesToNoElements() {
  var result = callGetAndVerifyMocks(funcNoElem);
  assertEquals(null, result);
}

function testGetReturnsElementWhenXPathResolvesToSingleElement() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(elem);
  mockNodeset.iterateNext().$returns(null);
  var result = callGetAndVerifyMocks('xpath');
  assertEquals(elem, result);
  assertEquals(elem, recordedElems[0]);
  assertEquals('xpath', recordedLocators[0]);
}

function testGetReturnsElementFromCacheWhenXPathAlreadyResolved() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(elem);
  mockNodeset.iterateNext().$returns(null);
  callGetAndVerifyMocks('xpath');
  // Deliberately call get again, which should not call any mocks.
  var result = callGetAndVerifyMocks('xpath');
  assertEquals(elem, result);
}

function testGetRaisesErrorWhenXPathResolvesToMultipleElements() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(elem);
  mockNodeset.iterateNext().$returns(document.body);
  puppet.logging.error(goog.testing.mockmatchers.isString);
  callGetAndVerifyMocks('xpath');
}

function testGetRaisesErrorWhenFunctionResolvesToMultipleElements() {
  puppet.logging.error(goog.testing.mockmatchers.isString);
  callGetAndVerifyMocks(funcReturnsArray);
}

function callGetAndVerifyMocks(pathOrElem) {
  mockControl.$replayAll();
  var result = puppet.elements.get(pathOrElem, mockWindow, state);
  mockControl.$verifyAll();
  return result;
}

function testGetAllIsIdentifyFunctionWhenArgumentIsArray() {
  var result = callGetAllAndVerifyMocks([elem, document.body]);
  assertArrayEquals([elem, document.body], result);
}

function testGetAllWhenArgumentIsFunctionReturningArray() {
  var result = callGetAllAndVerifyMocks(funcReturnsArray);
  assertArrayEquals([elem, document.body], result);
}

function testGetAllReturnsEmptyArrayWhenXPathResolvesToNoElements() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(null);
  var result = callGetAllAndVerifyMocks('xpath');
  assertArrayEquals([], result);
}

function testGetAllReturnsEmptyArrayWhenFunctionResolvesToNoElements() {
  var result = callGetAllAndVerifyMocks(funcNoElem);
  assertArrayEquals([], result);
}

function testGetAllReturnsSingletonArrayWhenXPathResolvesToOneElement() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(elem);
  mockNodeset.iterateNext().$returns(null);
  var result = callGetAllAndVerifyMocks('xpath');
  assertArrayEquals([elem], result);
}

function testGetAllReturnsSingletonArrayWhenFunctionResolvesToOneElement() {
  var result = callGetAllAndVerifyMocks(funcElem);
  assertArrayEquals([elem], result);
}

function testGetAllReturnsArrayWhenXPathResolvesToMultipleElements() {
  puppet.xpath.resolveXPath('xpath', mockWindow).$returns(mockNodeset);
  mockNodeset.iterateNext().$returns(elem);
  mockNodeset.iterateNext().$returns(document.body);
  mockNodeset.iterateNext().$returns(null);
  var result = callGetAllAndVerifyMocks('xpath');
  assertArrayEquals([elem, document.body], result);
  assertEquals(elem, recordedElems[0][0]);
  assertEquals(document.body, recordedElems[0][1]);
  assertEquals('xpath', recordedLocators[0]);
}

function testGetAllReturnsArrayWhenFunctionResolvesToMultipleElements() {
  var result = callGetAllAndVerifyMocks(funcReturnsArray);
  assertArrayEquals([elem, document.body], result);
}

function callGetAllAndVerifyMocks(pathOrElem) {
  mockControl.$replayAll();
  var result = puppet.elements.getAll(pathOrElem, mockWindow);
  mockControl.$verifyAll();
  return result;
}

function testFlashOnFromNoneChangesColor() {
  assertFlashChangesColor(true);
}

function testFlashOffFromNoneDoesNotChangeColor() {
  assertFlashDoesNotChangeColor(false);
}

function testFlashOnFromOffChangesColor() {
  puppet.elements.flash(elem, false);
  assertFlashChangesColor(true);
}

function testFlashOffFromOffDoesNotChangeColor() {
  puppet.elements.flash(elem, false);
  assertFlashDoesNotChangeColor(false);
}

function testFlashOnFromOnDoesNotChangeColor() {
  puppet.elements.flash(elem, true);
  assertFlashDoesNotChangeColor(true);
}

function testFlashOffFromOnChangesColor() {
  puppet.elements.flash(elem, true);
  assertFlashChangesColor(false);
}

function testFlashOffDoesNotRevertColorIfNotFlashed() {
  puppet.elements.flash(elem, true);
  elem.style['background-color'] = 'blue';
  assertFlashDoesNotChangeColor(false);
}

function assertFlashChangesColor(on) {
  var prevColor = elem.style['background-color'];
  puppet.elements.flash(elem, on);
  var newColor = elem.style['background-color'];
  assertNotEquals(prevColor, newColor);
}

function assertFlashDoesNotChangeColor(on) {
  var prevColor = elem.style['background-color'];
  puppet.elements.flash(elem, on);
  var newColor = elem.style['background-color'];
  assertEquals(prevColor, newColor);
}
