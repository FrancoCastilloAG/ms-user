import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name:'users'
})
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({ type: 'text' })
    nombre:string;

    @Column({ type: 'text' })
    email:string;
    
    @Column({ type: 'text' })
    password:string;

    validatePassword(password:string):boolean{
        return this.password === password;
    }
    getInfoToken(){
        return {
            id: this.id,
            email: this.email
        }
    }
}