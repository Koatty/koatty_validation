import ts from 'typescript';
import { IsString } from 'class-validator';
import { Validated } from '../../src/decorators';
class Dto { @IsString() name!: string; }
test.each([true,false])('AB-04 validation with real TS emit (legacy=%s)',async legacy=>{
  const source=`import { Validated, Dto } from 'fixture';
    export class Service {
      @Validated({async:false,partial:false,types:[Dto]}) save(input:Dto){ return input; }
    }`;
  const {outputText,diagnostics}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:legacy},reportDiagnostics:true});
  expect(diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error)).toEqual([]);
  const exports:any={}; new Function('require','exports',outputText)(()=>({Validated,Dto}),exports);
  const service=new exports.Service();
  expect(await service.save({name:'x',admin:true})).toEqual({name:'x'});
  await expect(service.save({})).rejects.toThrow();
});
