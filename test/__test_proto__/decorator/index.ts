export function Logger(log:string,ignoreResult:boolean){
    return function(originalMethod: any, _context: any){
        function replacementMethod(this: any, ...args: any[]) {
            console.log(log,' | arguments |  ',args)
            const result = originalMethod.call(this, ...args);
            !ignoreResult && console.log(log,' | result | ',result)
            return result;
        }
        return replacementMethod;
    }
}


export function Override(originalMethod: any, _context: ClassMethodDecoratorContext){
    if(_context.kind != "method"){
        throw new Error("OverRide Error")
    }
}