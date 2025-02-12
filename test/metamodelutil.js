/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const MetaModelUtil = require('../lib/metamodelutil');

const fs = require('fs');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-things'));

describe('MetaModel (Person)', () => {
    const personModelPath = path.resolve(__dirname, './cto/person.json');
    const personModel = JSON.parse(fs.readFileSync(personModelPath, 'utf8'));
    const personMetaModelResolved = JSON.parse(fs.readFileSync(path.resolve(__dirname, './cto/personResolved.json'), 'utf8'));

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            const mm1r = MetaModelUtil.resolveLocalNames(personModel, personModel.models[1]);
            // fs.writeFileSync(path.resolve(__dirname, './cto/personResolved.json'), JSON.stringify(mm1r, null, 2));
            mm1r.should.deep.equal(personMetaModelResolved);
        });
    });
});

describe('MetaModel (Empty)', () => {
    const emptyModelPath = path.resolve(__dirname, './cto/empty.json');
    const emptyModel = JSON.parse(fs.readFileSync(emptyModelPath, 'utf8'));
    const emptyMetaModelResolved = JSON.parse(fs.readFileSync(path.resolve(__dirname, './cto/emptyResolved.json'), 'utf8'));

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            const mm1r = MetaModelUtil.resolveLocalNames([], emptyModel);
            mm1r.should.deep.equal(emptyMetaModelResolved);
        });
    });
});

describe('MetaModel (Missing optional values)', () => {
    const model = {
        '$class': 'concerto.metamodel@1.0.0.Models',
        'models': [
            {
                '$class': 'concerto.metamodel@1.0.0.Model',
                'namespace': 'org.vehicle',
            },
            {
                '$class': 'concerto.metamodel@1.0.0.Model',
                'namespace': 'org.car',
                'imports': [
                    {
                        '$class': 'concerto.metamodel@1.0.0.ImportAll',
                        'namespace': 'org.vehicle'
                    }
                ],
                'declarations': [
                    {
                        '$class': 'concerto.metamodel@1.0.0.ConceptDeclaration',
                        'name': 'Car',
                        'isAbstract': false,
                        'properties': []
                    }
                ]
            }
        ]
    };

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            const mm1r = MetaModelUtil.resolveLocalNames([], model);
            mm1r.should.deep.equal(model);
        });
    });
});

describe('MetaModel (Car)', () => {
    const carModelPath = path.resolve(__dirname, './cto/car.json');
    const carModel = JSON.parse(fs.readFileSync(carModelPath, 'utf8'));
    const carMetaModelResolved = JSON.parse(fs.readFileSync(path.resolve(__dirname, './cto/carResolved.json'), 'utf8'));

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            const mm1r = MetaModelUtil.resolveLocalNamesForAll(carModel);
            mm1r.should.deep.equal(carMetaModelResolved);
        });
    });
});

describe('MetaModel (Car - with import types)', () => {
    const carModelPath = path.resolve(__dirname, './cto/carImportTypes.json');
    const carModel = JSON.parse(fs.readFileSync(carModelPath, 'utf8'));
    const carMetaModelResolved = JSON.parse(fs.readFileSync(path.resolve(__dirname, './cto/carImportTypesResolved.json'), 'utf8'));

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            const mm1r = MetaModelUtil.resolveLocalNamesForAll(carModel);
            mm1r.should.deep.equal(carMetaModelResolved);
        });
    });
});

describe('MetaModel (Car - wrong import)', () => {
    const carModelPath = path.resolve(__dirname, './cto/carWrongImport.json');
    const carModel = JSON.parse(fs.readFileSync(carModelPath, 'utf8'));

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            return (() => MetaModelUtil.resolveLocalNamesForAll(carModel)).should.Throw('Declaration VehicleWrong in namespace org.vehicle not found');
        });
    });
});

describe('MetaModel (Car - wrong extends)', () => {
    const carModelPath = path.resolve(__dirname, './cto/carWrongExtends.json');
    const carModel = JSON.parse(fs.readFileSync(carModelPath, 'utf8'));

    describe('#toMetaModel', () => {
        it('should convert a CTO model to its metamodel with name resolution', async () => {
            return (() => MetaModelUtil.resolveLocalNamesForAll(carModel)).should.Throw('Name VehicleWrong not found');
        });
    });
});

describe('importFullyQualifiedNames', () => {

    describe('#ImportAll', () => {
        it('should return imports', async () => {
            const ast = {
                $class: 'concerto.metamodel@1.0.0.ImportAll',
                namespace: 'test'
            };
            const result = MetaModelUtil.importFullyQualifiedNames(ast);
            result.should.deep.equal(['test.*']);
        });
    });

    describe('#ImportType', () => {
        it('should return imports', async () => {
            const ast = {
                $class: 'concerto.metamodel@1.0.0.ImportType',
                namespace: 'test',
                name: 'Foo'
            };
            const result = MetaModelUtil.importFullyQualifiedNames(ast);
            result.should.deep.equal(['test.Foo']);
        });
    });

    describe('#ImportTypes', () => {
        it('should return imports', async () => {
            const ast = {
                $class: 'concerto.metamodel@1.0.0.ImportTypes',
                namespace: 'test',
                types: ['Foo', 'Bar']
            };
            const result = MetaModelUtil.importFullyQualifiedNames(ast);
            result.should.deep.equal(['test.Foo', 'test.Bar']);
        });
    });

    it('should throw for unrecognized import', async () => {
        const ast = {
            $class: 'concerto.metamodel@1.0.0.MyImportType',
            namespace: 'test',
            types: ['Foo', 'Bar']
        };
        (() => {MetaModelUtil.importFullyQualifiedNames(ast);}).should.throw('Unrecognized imports concerto.metamodel@1.0.0.MyImportType');
    });
});

describe('getExternalImports', () => {
    it('should get external imports', () => {
        const ast = {
            imports: [{
                $class: 'concerto.metamodel@1.0.0.ImportAll',
                namespace: 'test',
                uri: 'https://dummyURI'
            }]
        };
        const result = MetaModelUtil.getExternalImports(ast);
        result.should.eql({'test.*':'https://dummyURI'});
    });
});
