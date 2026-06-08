import {describeHierarchyConformance} from '@semantic-matchers/conformance';
import nativeExpect from 'expect';
import {installSemanticExpect} from '../index.js';

describeHierarchyConformance(() => {
  const {expect} = installSemanticExpect(nativeExpect, {global: false});
  return {label: 'jest', expect};
});
