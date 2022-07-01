
// 함수
function sum(a,b){
    return a+b;
}

// 메소드
const obj1 = {
    a:10,
    b:20,
    total: 0,
    sum: function(){
        this.total = this.a + this.b;
    }
}

// 메소드 2
const obj2 = {
    total: 0,
    sum: function(a,b){
        return this.total = a + b;
    }
}

console.log(sum(1,2))
console.log(obj2.sum(3,4))
console.log(obj2.total)