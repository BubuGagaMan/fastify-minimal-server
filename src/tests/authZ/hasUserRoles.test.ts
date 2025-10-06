import test from "node:test";
import assert from "node:assert";
import testHasUserRoles from "./testHasUserRoles.js";



test('Role Validation Scenarios', async (t) => {

  // --- Success Cases (Should return true) ---

  await t.test('should return true when user has all required roles plus extras', () => {
    const userRoles = ['admin', 'editor', 'viewer'];
    const requiredRoles = ['admin', 'editor'];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), true, 'Test Failed: User with extra roles.');
  });

  await t.test('should return true when user has the exact required roles', () => {
    const userRoles = ['admin', 'editor'];
    const requiredRoles = ['admin', 'editor'];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), true, 'Test Failed: User with exact roles.');
  });

  await t.test('should return true when no roles are required', () => {
    const userRoles = ['viewer'];
    const requiredRoles: string[] = [];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), true, 'Test Failed: No roles required.');
  });

  await t.test('should return true when both user roles and required roles are empty', () => {
    const userRoles: string[] = [];
    const requiredRoles: string[] = [];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), true, 'Test Failed: Both lists empty.');
  });

  await t.test('should return true and handle duplicate roles correctly', () => {
    const userRoles = ['editor', 'viewer', 'editor'];
    const requiredRoles = ['editor', 'viewer'];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), true, 'Test Failed: Handling duplicates.');
  });

  // --- Failure Cases (Should return false) ---

  await t.test('should return false when user is missing one required role', () => {
    const userRoles = ['editor', 'viewer'];
    const requiredRoles = ['admin', 'editor'];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), false, 'Test Failed: Missing one role.');
  });

  await t.test('should return false when user is missing all required roles', () => {
    const userRoles = ['guest'];
    const requiredRoles = ['admin', 'editor'];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), false, 'Test Failed: Missing all roles.');
  });

  await t.test('should return false when user has no roles but roles are required', () => {
    const userRoles: string[] = [];
    const requiredRoles: string[]= ['admin'];
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), false, 'Test Failed: User has no roles.');
  });

  await t.test('should return false due to case sensitivity', () => {
    const userRoles = ['Admin', 'editor']; // 'Admin' with a capital 'A'
    const requiredRoles = ['admin', 'editor']; // 'admin' with a lowercase 'a'
    assert.strictEqual(testHasUserRoles(userRoles, requiredRoles), false, 'Test Failed: Case sensitivity.');
  });
});