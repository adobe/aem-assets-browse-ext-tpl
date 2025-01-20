/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const defaultExtensionManifest = {
  "name": "AEM Assets View ActionBar Test Extension",
  "id": "aem-assets-browse-test-extension",
  "description": "Test Extension for AEM Assets View ActionBar",
  "version": "0.0.1"
}

const customExtensionManifest = {
  "name": "AEM Assets View ActionBar Test Extension",
  "id": "aem-assets-browse-test-extension",
  "description": "Test Extension for AEM Assets View ActionBar",
  "version": "0.0.1",
  "actionBarActions": [
    {
      "id": "a1",
      "icon": "Attributes",
      "label": "Label 1"
    },
    {
      "id": "a2",
      "icon": "Chat",
      "label": "Label 2"
    }
  ],
  "runtimeActions": [
    {
      "name": "attributes"
    },
    {
      "name": "chat"
    }
  ]
}

module.exports = {
  defaultExtensionManifest,
  customExtensionManifest,
}