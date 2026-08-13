from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Banco de dados temporário em memória
estoque = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/colheita', methods=['POST'])
def registrar_colheita():
    data = request.json
    nome = data['produto'].strip().capitalize()
    qtd = int(data['quantidade'])
    custo = float(data['preco_custo'])
    venda = float(data['preco_venda'])

    if nome in estoque:
        estoque[nome]['colhido'] += qtd
    else:
        estoque[nome] = {
            'colhido': qtd,
            'perdido': 0,
            'preco_custo': custo,
            'preco_venda': venda
        }
    return jsonify({'status': 'sucesso', 'estoque': estoque})

@app.route('/perda', methods=['POST'])
def registrar_perda():
    data = request.json
    nome = data['produto'].strip().capitalize()
    qtd = int(data['quantidade'])

    if nome not in estoque:
        return jsonify({'status': 'erro', 'mensagem': 'Produto não cadastrado'}), 400

    disponivel = estoque[nome]['colhido'] - estoque[nome]['perdido']
    if qtd > disponivel:
        return jsonify({'status': 'erro', 'mensagem': 'Quantidade maior que o estoque!'}), 400

    estoque[nome]['perdido'] += qtd
    return jsonify({'status': 'sucesso', 'estoque': estoque})

if __name__ == '__main__':
    app.run(debug=True)