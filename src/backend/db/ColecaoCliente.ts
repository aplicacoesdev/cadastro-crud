import { db } from "../config";
import Cliente from "../../core/Cliente";
import ClienteRepositorio from "../../core/ClienteRepositorio";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc } from "firebase/firestore";

export default class ColecaoCliente implements ClienteRepositorio {

    #conversor = {
        toFirestore(cliente: Cliente) {
            return {
                nome: cliente.nome,
                idade: cliente.idade,
            }
        },
        fromFirestore(snapshot: any, options: any): Cliente {
            const dados = snapshot.data(options)
            return new Cliente(dados.nome, dados.idade, snapshot.id)
        }
    }

    async salvar(cliente: Cliente): Promise<Cliente> {
        if (cliente?.id) {
            const docRef = doc(db, 'clientes', cliente.id).withConverter(this.#conversor)
            await setDoc(docRef, cliente)
            return cliente
        } else {
            const docRef = await addDoc(this.colecao(), cliente)
            const document = await getDoc(docRef)
            return document.data()
        }
    }

    async excluir(cliente: Cliente): Promise<void> {
        return deleteDoc(doc(db, 'clientes', cliente.id))
    }

    async obterTodos(): Promise<Cliente[]> {
        const query = await getDocs(this.colecao())
        return query.docs.map(doc => doc.data()) ?? []
    }

    private colecao() {
        return collection(db, 'clientes')
            .withConverter(this.#conversor)
    }
}