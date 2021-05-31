const React = require("react");
const { fireEvent, render, within } = require("@testing-library/react-native");
const {
  VISIBLE_SCREEN_TEST_ID,
  VISIBLE_OVERLAY_TEST_ID,
} = require("react-native-navigation");

const { fireEvent, render, within } = require("@testing-library/react-native");
const { ApplicationMock } = require("react-native-navigation");
App = render(<ApplicationMock entryPoint={entrypoint} />);

const isDetox = () => !!process.env.DETOX_START_TIMESTAMP;

const extendDetox = () => {
  it.e2e = (name, fn) => {
    if (isDetox()) {
      it(name, fn);
    }
  };

  describe.e2e = (name, fn) => {
    if (isDetox()) {
      describe(name, fn);
    } else {
      xdescribe(name, fn);
    }
  };
};

const mockDetox = (entrypoint) => {
  extendDetox();
  let App;

  global.device = {
    launchApp: () => {
      const { ApplicationMock } = require("react-native-navigation");
      App = render(<ApplicationMock entryPoint={entrypoint} />);
      return App;
    },
  };

  global.element = (e) => e;
  global.by = {
    text: (text) => elementByLabel(text, App),
    id: (id) => {
      return elementById(id, App);
    },
  };

  const origExpect = expect;
  expect = (e) => {
    const match = origExpect(e);
    match.toBeNotVisible = () => {
      return match.toBe(null);
    };
    match.toBeVisible = () => match.toBeTruthy();
    match.toExist = match.toBeVisible;
    return match;
  };
};

function elementById(id, App) {
  let element = null;
  if (within(App.getByTestId(VISIBLE_SCREEN_TEST_ID)).queryByTestId(id)) {
    element = within(App.getByTestId(VISIBLE_SCREEN_TEST_ID)).getByTestId(id);
  } else if (
    within(App.getByTestId(VISIBLE_OVERLAY_TEST_ID)).queryByTestId(id)
  ) {
    element = within(App.getByTestId(VISIBLE_OVERLAY_TEST_ID)).getByTestId(id);
  }

  if (element)
    element.tap = async () => {
      await fireEvent.press(element);
    };

  return element;
}

function elementByLabel(label, App) {
  let element = null;
  if (within(App.getByTestId(VISIBLE_SCREEN_TEST_ID)).queryByText(label)) {
    element = within(App.getByTestId(VISIBLE_SCREEN_TEST_ID)).getByText(label);
  } else if (
    within(App.getByTestId(VISIBLE_OVERLAY_TEST_ID)).queryByText(label)
  ) {
    element = within(App.getByTestId(VISIBLE_OVERLAY_TEST_ID)).getByText(label);
  }

  if (element)
    element.tap = async () => {
      await fireEvent.press(element);
    };

  return element;
}

export { mockDetox, extendDetox };
