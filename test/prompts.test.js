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

const inquirer = require('inquirer');
const { promptTopLevelFields, promptMainMenu, nestedActionBarPrompts } = require('../src/prompts');

jest.mock('inquirer');

describe('prompts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('promptTopLevelFields', () => {
        it('should prompt for name, description, and version, validate inputs, and update the manifest', async () => {
            const mockManifest = {};
            const mockAnswers = {
                name: 'Test Extension',
                description: 'This is a test extension',
                version: '1.0.0'
            };

            inquirer.prompt.mockImplementation(async (questions) => {
                // Test validation passes for valid inputs
                questions.forEach(q => {
                    expect(q.validate(mockAnswers[q.name])).toBe(true);
                });
                return mockAnswers;
            });

            await promptTopLevelFields(mockManifest);

            expect(mockManifest).toEqual({
                name: 'Test Extension',
                id: 'test-extension',
                description: 'This is a test extension',
                version: '1.0.0'
            });

            // Test validation fails for invalid inputs
            const questions = inquirer.prompt.mock.calls[0][0];
            expect(questions.find(q => q.name === 'name').validate('')).toBe('Required.');
            expect(questions.find(q => q.name === 'description').validate('')).toBe('Required.');
            expect(questions.find(q => q.name === 'version').validate('invalid')).toBe('Required. Must match semantic versioning rules.');
        });

        it('should validate wrong input', async () => {
            const mockIncorrectAnswers = {
                name: '',
                description: '',
                version: 'invalid'
            };
            const mockCorrectAnswers = {
                name: '',
                description: 'This is a test extension',
                version: '1.0.0'
            };
            const actualValidationResults = {};
            const expectedValidationResults = {
                name: 'Required.',
                description: 'Required.',
                version: 'Required. Must match semantic versioning rules.'
            };

            inquirer.prompt.mockImplementation(async (questions) => {
                Object.keys(mockIncorrectAnswers).map((key) => {
                    const question = questions.find((question) => question.name === key);
                    actualValidationResults[key] = question.validate(mockIncorrectAnswers[key]);
                });
                return mockCorrectAnswers;
            });
            await promptTopLevelFields(mockIncorrectAnswers);

            await expect(actualValidationResults).toEqual(expectedValidationResults);
        });
    });

    describe('promptMainMenu', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should prompt the main menu and exit when selected action returns true', async () => {
            const mockManifest = {};
            const mockAnswers = {
                execute: jest.fn().mockResolvedValue(true)
            };

            inquirer.prompt.mockResolvedValue(mockAnswers);

            await promptMainMenu(mockManifest);

            expect(inquirer.prompt).toHaveBeenCalledWith(expect.objectContaining({
                type: 'list',
                name: 'execute',
                message: 'What would you like to do next?',
                choices: expect.any(Array)
            }));
            expect(mockAnswers.execute).toHaveBeenCalled();
            expect(inquirer.prompt).toHaveBeenCalledTimes(1);
        });

        it('should prompt the main menu recursively when selected action returns false', async () => {
            const mockManifest = {};
            const mockAnswers = {
                execute: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
            };

            inquirer.prompt.mockResolvedValue(mockAnswers);

            await promptMainMenu(mockManifest);

            expect(inquirer.prompt).toHaveBeenCalledTimes(2);
            expect(mockAnswers.execute).toHaveBeenCalledTimes(2);
        });
    });

    describe('promptNestedActionBarPrompts', () => {
        it('should prompt the action bar button and expected the basic prompts', async () => {
            const mockManifest = {};
            const mockAnswers = {
                label: 'Custom Action',
                icon: 'ABC',
                needsModal: false,
            };

            inquirer.prompt.mockResolvedValue(mockAnswers);

            await nestedActionBarPrompts(mockManifest, 'actionBarActions');

            expect(inquirer.prompt).toHaveBeenCalledTimes(1);

            expect(inquirer.prompt).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: 'input',
                    name: 'label',
                    message: 'Please provide label for the ActionBar action:',
                    validate: expect.any(Function),
                }),
                expect.objectContaining({
                    type: 'autocomplete',
                    name: 'icon',
                    message: 'Please select React Spectrum icon for the ActionBar action:',
                    source: expect.any(Function),
                }),
                expect.objectContaining({
                    type: 'confirm',
                    name: 'needsModal',
                    message: 'Do you need to show a modal for the button?',
                    default: false,
                }),
            ]);
        });

        it('should prompt the action bar button and expected the basic + modal prompts with fullScreen modal', async () => {
            const mockManifest = {};
            const mockAnswers = {
                label: 'Custom Action',
                icon: 'ABC',
                needsModal: true,
                modalType: 'fullScreen',
            };

            inquirer.prompt.mockResolvedValue(mockAnswers);

            await nestedActionBarPrompts(mockManifest, 'actionBarActions');

            expect(inquirer.prompt).toHaveBeenCalledTimes(2);

            expect(inquirer.prompt).toHaveBeenNthCalledWith(1, [
                expect.objectContaining({
                    type: 'input',
                    name: 'label',
                    message: 'Please provide label for the ActionBar action:',
                    validate: expect.any(Function),
                }),
                expect.objectContaining({
                    type: 'autocomplete',
                    name: 'icon',
                    message: 'Please select React Spectrum icon for the ActionBar action:',
                    source: expect.any(Function),
                }),
                expect.objectContaining({
                    type: 'confirm',
                    name: 'needsModal',
                    message: 'Do you need to show a modal for the button?',
                    default: false,
                }),
            ]);

            expect(inquirer.prompt).toHaveBeenNthCalledWith(2, [
                expect.objectContaining(
                    {
                        type: 'input',
                        name: 'modalTitle',
                        message: 'Please provide the title for the modal:',
                        validate: expect.any(Function),
                    }
                ),expect.objectContaining(
                    {
                        type: 'list',
                        name: 'modalType',
                        message: 'Please select the type for the modal:',
                        default: 'modal',
                        "choices": [
                            "modal",
                            "fullScreen",
                        ],
                    }
                ),
            ]);
        });

        it('should prompt the action bar button and expected the basic + modal prompts', async () => {
            const mockManifest = {};
            const mockAnswers = {
                label: 'Custom Action',
                icon: 'ABC',
                needsModal: true,
                modalType: 'modal',
                modalSize: 'l',
            };

            inquirer.prompt.mockResolvedValue(mockAnswers);

            await nestedActionBarPrompts(mockManifest, 'actionBarActions');

            expect(inquirer.prompt).toHaveBeenCalledTimes(3);

            expect(inquirer.prompt).toHaveBeenNthCalledWith(1, [
                expect.objectContaining({
                    type: 'input',
                    name: 'label',
                    message: 'Please provide label for the ActionBar action:',
                    validate: expect.any(Function),
                }),
                expect.objectContaining({
                    type: 'autocomplete',
                    name: 'icon',
                    message: 'Please select React Spectrum icon for the ActionBar action:',
                    source: expect.any(Function),
                }),
                expect.objectContaining({
                    type: 'confirm',
                    name: 'needsModal',
                    message: 'Do you need to show a modal for the button?',
                    default: false,
                }),
            ]);

            expect(inquirer.prompt).toHaveBeenNthCalledWith(2, [
                expect.objectContaining(
                    {
                        type: 'input',
                        name: 'modalTitle',
                        message: 'Please provide the title for the modal:',
                        validate: expect.any(Function),
                    }
                ),expect.objectContaining(
                    {
                        type: 'list',
                        name: 'modalType',
                        message: 'Please select the type for the modal:',
                        default: 'modal',
                        "choices": [
                            "modal",
                            "fullScreen",
                        ],
                    }
                ),
            ]);

            expect(inquirer.prompt).toHaveBeenNthCalledWith(3,
                expect.objectContaining(
                    {
                        type: 'list',
                        name: 'modalSize',
                        message: 'Please select the size for the modal:',
                    }
                ),
            );
        });
    });
});
