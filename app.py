from flask import Flask, render_template, request, jsonify
from datetime import datetime, date

app = Flask(__name__)

# Banco de dados temporário em memória ajustado para suportar lotes por data
# Formato: list de lotes ou dicionário por lote
estoque_lotes = []

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
    
    # Captura a data informada ou usa a data atual caso não seja enviada
    data_colheita_str = data.get('data_colheita', date.today().isoformat())

    lote = {
        'id': len(estoque_lotes) + 1,
        'produto': nome,
        'quantidade': qtd,
        'preco_custo': custo,
        'preco_venda': venda,
        'data_colheita': data_colheita_str
    }
    
    estoque_lotes.append(lote)
    return jsonify({'status': 'sucesso', 'lote': lote})

@app.route('/estoque', methods=['GET'])
def consultar_estoque():
    hoje = date.today()
    estoque_ordenado = []

    # Processa cada lote para calcular os dias em estoque e a prioridade
    for lote in estoque_lotes:
        dt_colheita = datetime.strptime(lote['data_colheita'], '%Y-%m-%d').date()
        dias_em_estoque = (hoje - dt_colheita).days
        
        # Alerta: Se tiver mais de 3 dias no estoque
        alerta_risco = dias_em_estoque > 3

        lote_info = {
            **lote,
            'dias_em_estoque': dias_em_estoque,
            'risco_perda': alerta_risco,
            'mensagem_alerta': 'URGENTE: Risco de estragar!' if alerta_risco else 'Normal'
        }
        estoque_ordenado.append(lote_info)

    # Ordena os lotes da colheita mais antiga para a mais recente
    estoque_ordenado.sort(key=lambda x: x['data_colheita'])

    return jsonify({'status': 'sucesso', 'estoque': estoque_ordenado})

if __name__ == '__main__':
    app.run(debug=True)