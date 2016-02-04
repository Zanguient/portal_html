/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/02/2016
 *
 */

// App
angular.module("card-services-impressao-relatorios", ['ui.router','utils', 'webapi']) 

	.controller("card-services-impressao-relatoriosCtrl", 
                                           ['$rootScope',
                                            '$scope',   
                                            '$location',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',    
                                            function($rootScope,$scope,$location,/*$campos,*/
																											$webapi,$apis,$timeout){ 
   
    //$scope.notadetalhada = undefined;
		$scope.relatorio = [];
		$scope.usuariologado = [];
		//Telas para impressao
		$scope.colunas = [];
    // flags
    $scope.exibeTela = false;  
    $scope.manutencao = false;                                                                       
		$scope.total = { valorBruto : 0.0, valorDescontado : 0.0, valorLiquido : 0.0 };
		$scope.dtSplit = [];
                                                
    // Inicialização do controller
    $scope.cardServices_impressaoRelatoriosInit = function(){
			
			var e = $location.search().e;
			var s = $location.search().s;
			var cl = $location.search().cl;
			var n = $location.search().n;
			var f = $location.search().f;
			var t = $location.search().t;
			
			if(!s || !cl || !n || !e || !f || !t) return;
			
			$scope.nomeEmpresa = e;
			$scope.nomeFilial = f;
			$scope.nColunas = cl;
			$scope.nomeRelatorio = s;
			$scope.token = t;
			$scope.nNiveis = n;
			
			
			switch (s) {
					
					//RELATORIOS CONCILIACAO
				case "Relatório de Conciliação":
					var c = $location.search().c;
					var d = $location.search().d;
					
					if(!c || !d) return;				
					
					$scope.colunas = ["Competência Adquirente Bandeira", "Taxa Média", "Vendas", "Taxa ADM", "Ajustes Crédito", "Ajustes Débito", "Valor Líquido", "Valor Descontado Antecipação", "Valor Líquido Total", "Extratos Bancários", "Diferença", "Status"];
					$scope.niveis = ["Nivel 1", "Nível 2", "Nivel 3"];
										
					$scope.data = $scope.formataData(d);
					$scope.dataConsulta = d;
					$scope.cnpj = c;
					
					consultaConciliacao(function(){ $scope.exibeTela = true; $timeout(function(){$scope.imprime();}, 1500) });
					break;
					
				case "Relatório de Recebíveis Futuros":
					var c = $location.search().c;
					var d = $location.search().d;
					
					if(!c || !d) return;
					
					$scope.colunas = ["Competência Adquirente Bandeira", "Valor Bruto", "Valor Descontado", "Recebíveis Futuros"];
					$scope.niveis = ["Nível 1", "Nível 2", "Nível 3"];
					
					$scope.data = $scope.formataData(d);
					$scope.dataConsulta = d;
					$scope.cnpj = c;
					
					consultaRecebiveisFuturos(function(){ $scope.exibeTela = true; $timeout(function(){$scope.imprime();}, 1500) });
					break;
					
				case "Relatório de Recebíveis Vendas":
					var c = $location.search().c;
					var d = $location.search().d;
					
					if(!c || !d) return;
					
					$scope.colunas = ["Competência Adquirente Bandeira", "Valor Bruto", "Valor Descontado", "Valor Líquido"];
					$scope.colunas2 = ["Valor Recebido", "Valor A Receber"];
					$scope.niveis = ["Nível 1", "Nível 2", "Nível 3"];
					
					$scope.data = $scope.formataData(d);
					$scope.dataConsulta = d;
					$scope.cnpj = c;
					
					consultaRecebiveisVendas(function(){ $scope.exibeTela = true; $timeout(function(){$scope.imprime();}, 1500) });
					break;
			}			
			
			// Deleta o parâmetro token da url
			//$location.search('t', null);
		}     
		
		//CONSULTA RELATORIO CONCILIACAO
		var consultaConciliacao = function(funcaoSucesso){
			
			showProgress();
			
			var filtros = [];
			
			//FILTROS				
			//Data
			filtros.push({
				id: /*$campos.card.conciliacaorelatorios.data*/ 100, 
				valor: $scope.dataConsulta
			});
			
			//Filial - CNPJ
			filtros.push({
				id: /*$campos.card.conciliacaorelatorios.nu_cnpj*/ 102,
				valor: $scope.cnpj
			});
			
			$webapi.get($apis.getUrl($apis.card.conciliacaorelatorios, [$scope.token, 0], filtros)) 
				.then(function(dados){
				$scope.relatorio = dados.Registros;
				if(typeof funcaoSucesso === 'function') funcaoSucesso();
				hideProgress();
			},
							function(failData){
                 if(failData.status === 0) showModalAlerta('Falha de comunicação com o servidor'); 
                 else if(failData.status === 503 || failData.status === 404) $scope.manutencao = true;
                 else showModalAlerta('Houve uma falha ao obter dados do relatório de conciliação (' + failData.status + ')');
                 hideProgress();
              });
		};
																							
		//CONSULTA RECEBIVEIS FUTUROS
		var consultaRecebiveisFuturos = function(funcaoSucesso){
			// Abre os progress
			showProgress();
			
			//FILTROS				
			var filtros = [];	
			
			// Filtros Por Data
			filtros.push({id: /*$campos.card.recebiveisfuturos.data*/ 100,
										valor: $scope.dataConsulta
									 });			
			// Filial
			filtros.push({id: /*$campos.card.recebiveisfuturos.nu_cnpj*/ 102, 
										valor: $scope.cnpj
									 });  
			
			
			//console.log(filtros);
			$webapi.get($apis.getUrl($apis.card.recebiveisfuturos, [$scope.token, 0], filtros)) 
				.then(function(dados){
				//console.log(dados);
				// Obtém os dados
				$scope.relatorio = dados.Registros;
				if(typeof funcaoSucesso === 'function') funcaoSucesso();
				// Totais
				$scope.total.valorBruto = dados.Totais.valorBruto;
				$scope.total.valorDescontado = dados.Totais.valorDescontado;
				$scope.total.valorLiquido = dados.Totais.valorLiquido;
				
				// Fecha os progress
				hideProgress();
			},
							function(failData){
                 if(failData.status === 0) showModalAlerta('Falha de comunicação com o servidor'); 
                 else if(failData.status === 503 || failData.status === 404) $scope.manutencao = true;
                 else showModalAlerta('Houve uma falha ao obter recebíveis futuros (' + failData.status + ')');
                 hideProgress();
              });           
		};
																							
		//CONSULTA RECEBIVEIS VENDAS
		var consultaRecebiveisVendas = function(funcaoSucesso){
			// Abre os progress
			showProgress();
			
			//FILTROS				
			var filtros = [];	
			
			// Filtros Por Data
			filtros.push({id: /*$campos.card.relatoriovendas.data*/ 100,
										valor: $scope.dataConsulta
									 });			
			// Filial
			filtros.push({id: /*$campos.card.relatoriovendas.nu_cnpj*/ 102, 
										valor: $scope.cnpj
									 });  
			
			
			//console.log(filtros);
			$webapi.get($apis.getUrl($apis.card.relatoriovendas, [$scope.token, 0], filtros)) 
            .then(function(dados){
				//console.log(dados);
				// Obtém os dados
				$scope.relatorio = dados.Registros;
				if(typeof funcaoSucesso === 'function') funcaoSucesso();
				
				// Totais
				$scope.total.valorBruto = dados.Totais.valorBruto;
				$scope.total.valorDescontado = dados.Totais.valorDescontado;
				$scope.total.valorLiquido = dados.Totais.valorLiquido;
				$scope.total.valorRecebido = dados.Totais.valorRecebido;
				$scope.total.valorAReceber = dados.Totais.valorAReceber;
				
				// Fecha os progress
				hideProgress();
			},
							function(failData){
                 if(failData.status === 0) showModalAlerta('Falha de comunicação com o servidor'); 
                 else if(failData.status === 503 || failData.status === 404) $scope.manutencao = true;
                 else showModalAlerta('Houve uma falha ao obter recebíveis vendas (' + failData.status + ')');
                 hideProgress();
              });           
		};
																							
		// UTILS
    
   /**
     * Impressão
     */
   $scope.imprime = function(){
       window.print();    
   }
    
   // PROGRESS                        
    /**
     * Exibe o loading progress no portlet-body
     */
   var showProgress = function(){
        Metronic.blockUI({
            animate: true,
            overlayColor: '#000'
        }); 
   };
   /**
     * Remove da visão o loading progress no portlet-body
     */                         
   var hideProgress = function(){
        Metronic.unblockUI();
   };                                            
   
   // MODAL ALERTA
    $scope.alerta = {titulo : '', mensagem : '', textoOk : 'Ok', funcaoOk: function(){}};
    var fechaModalAlerta = function(){
        $('#modalAlerta').modal('hide');    
    }; 
    /**
      * Exibe modal com a mensagem de alerta
      */
    var showModalAlerta = function(mensagem, titulo, textoOk, funcaoOk){
        $scope.alerta.titulo = titulo ? titulo : 'Info';
        $scope.alerta.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.alerta.textoOk = textoOk ? textoOk : 'Ok';
        $scope.alerta.funcaoOk = typeof funcaoOk === 'function' ? 
                                    function(){fechaModalAlerta(); funcaoOk();}  :  
                                    function(){fechaModalAlerta()};
        // Exibe o modal
        $('#modalAlerta').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }
		
		$scope.formataData = function(data){
			
			//Split para separar os caracteres que formam a data
			$scope.dtSplit = data.split("");
			
			if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
				//Nesse caso captura os caracteres uma posição a frente pois na primeira existe um caractere útil apenas para a consulta
				$scope.dia = $scope.dtSplit[7] + $scope.dtSplit[8];
				$scope.mes = $scope.dtSplit[5] + $scope.dtSplit[6];
				$scope.ano = $scope.dtSplit[1] + $scope.dtSplit[2] + $scope.dtSplit[3] + $scope.dtSplit[4];
			} else {
				$scope.mes = $scope.dtSplit[4] + $scope.dtSplit[5];
				$scope.ano = $scope.dtSplit[0] + $scope.dtSplit[1] + $scope.dtSplit[2] + $scope.dtSplit[3];				
			}
			
			$scope.dataFormatada = "";
			
			switch ($scope.mes){
				case "01":
					$scope.dataFormatada = "Janeiro " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "02":
					$scope.dataFormatada = "Fevereiro " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "03":
					$scope.dataFormatada = "Março " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "04":
					$scope.dataFormatada = "Abril " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
				
				case "05":
					$scope.dataFormatada = "Maio " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
				
				case "06":
					$scope.dataFormatada = "Junho " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
									
				case "07":
					$scope.dataFormatada = "Julho " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "08":
					$scope.dataFormatada = "Agosto " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "09":
					$scope.dataFormatada = "Setembro " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "10":
					$scope.dataFormatada = "Outubro " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "11":
					$scope.dataFormatada = "Novembro " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				case "12":
					$scope.dataFormatada = "Dezembro " + $scope.ano;
					if ($scope.nomeRelatorio == "Relatório de Recebíveis Futuros"){
						$scope.dataFormatada = $scope.dia + " " + $scope.dataFormatada;
					}
					break;
					
				default:
					$scope.dataFormatada = "Erro de formatação"
					break;
			}
			return $scope.dataFormatada;
		}
		
		$scope.formaTabela = function(){
			document.write('<tr><td>Volvo</td><td>S60</td><td>2010</td><td>Saloon</td><td>Yes</td></tr><tr><td colspan="5"><table><colgroup><col class="coluna1"/><col class="coluna2"/><col class="coluna3"/></colgroup><tr><th>Agudo</th><th >Médio</th><th >Grave</th></tr><tr><td>Trompete</td><td>Trompa</td><td>Trombone</td></tr></table> </td></tr><tr><td>Audi</td><td>A4</td><td>2002</td><td>Saloon</td><td>Yes</td></tr>');
		}
		
}]);