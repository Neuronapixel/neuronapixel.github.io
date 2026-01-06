import { describe, it, expect, beforeEach } from 'vitest';

describe('Main entry file', () => {
  // Before each test, ensure the DOM contains a target element for mounting.
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('mounts the app on the #app element', async () => {
    // Dynamically import the main file so that it executes its side effects.
    // Adjust the path to your main file as needed.
    await import('@/main');

    // Now, get the element with id "app".
    const appContainer = document.getElementById('app');

    // Verify that the app container exists.
    expect(appContainer).toBeTruthy();

    // Optionally, check that the container's innerHTML is non-empty,
    // indicating that something was rendered.
    expect(appContainer!.innerHTML).not.toBe('');
  });
});
