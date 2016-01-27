/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 25/01/2016
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
                                                
    // Inicialização do controller
    $scope.cardServices_impressaoRelatoriosInit = function(){
			
			var e = $location.search().e;
			var s = $location.search().s;
			var cl = $location.search().cl;
			var n = $location.search().n;
			var f = $location.search().f;
			var d = $location.search().d;
			
			if(!d || !s || !cl || !n || !e || !f) return;
			
			$scope.nomeEmpresa = e;
			$scope.nomeFilial = f;
			$scope.data = $scope.formataData(d);
			
			switch (s) {
					
					//RELATORIOS CONCILIACAO
				case "relatorioConciliacao":
					var c = $location.search().c;
					if(!c || !d) return;				
					
					$scope.colunas = ["Competência Adquirente Bandeira", "Taxa Média", "Vendas", "Taxa ADM", "Ajustes Crédito", "Ajustes Débito", "Valor Líquido", "Valor Descontado Antecipação", "Valor Líquido Total", "Extratos Bancários", "Diferença", "Status"];
					
					consultaConciliacao(c, d);
					break;
			}
			
			
			// Deleta o parâmetro token da url
			//$location.search('t', null);
		}     
		
    var consultaConciliacao = function(c, d){
			// Abre os progress
			//$scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
			//$scope.showProgress(divPortletBodyRelatorioPos);
			
			// Filtros    
			var filtros = [];
			
			// Filtros Por Data
			filtros.push({id: /*$campos.card.conciliacaorelatorios.data*/ 100,
										valor: d});
			
			// Filial
			filtros.push({id: /*$campos.card.conciliacaorelatorios.nu_cnpj*/ 102, 
										valor: c});  
			
			//console.log(filtros);			
			$webapi.get($apis.getUrl($apis.card.conciliacaorelatorios, [$scope.token, 0], filtros)) 
				.then(function(dados){
				// Obtém os dados
				$scope.relatorio = dados.Registros;
				
				// Fecha os progress
				hideProgress();
			},        
							function(failData){
				if(failData.status === 0) showModalAlerta('Falha de comunicação com o servidor'); 
				else if(failData.status === 503 || failData.status === 404) $scope.manutencao = true;
				else showModalAlerta('Houve uma falha ao obter relatório de conciliação (' + failData.status + ')');
				hideProgress();
			});     
		}
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
			
			$scope.dtSplit = data.split("");
			$scope.mes = $scope.dtSplit[4] + $scope.dtSplit[5];
			$scope.ano = $scope.dtSplit[0] + $scope.dtSplit[1] + $scope.dtSplit[2] + $scope.dtSplit[3];
			$scope.dataFormatada = "";
			
			switch ($scope.mes){
				case "01":
					$scope.dataFormatada = "Janeiro " + $scope.ano;
					break;
					
				case "02":
					$scope.dataFormatada = "Fevereiro " + $scope.ano;
					break;
					
				case "03":
					$scope.dataFormatada = "Março " + $scope.ano;
					break;
					
				case "04":
					$scope.dataFormatada = "Abril " + $scope.ano;
					break;
				
				case "05":
					$scope.dataFormatada = "Maio " + $scope.ano;
					break;
				
				case "06":
					$scope.dataFormatada = "Junho " + $scope.ano;
					break;
									
				case "07":
					$scope.dataFormatada = "Julho " + $scope.ano;
					break;
					
				case "08":
					$scope.dataFormatada = "Agosto " + $scope.ano;
					break;
					
				case "09":
					$scope.dataFormatada = "Setembro " + $scope.ano;
					break;
					
				case "10":
					$scope.dataFormatada = "Outubro " + $scope.ano;
					break;
					
				case "11":
					$scope.dataFormatada = "Novembro " + $scope.ano;
					break;
					
				case "12":
					$scope.dataFormatada = "Dezembro " + $scope.ano;
					break;
					
				default:
					break;
			}
			return $scope.dataFormatada;
		}
		
		$scope.formaTabela = function(){
			document.write('<tr><td>Volvo</td><td>S60</td><td>2010</td><td>Saloon</td><td>Yes</td></tr><tr><td colspan="5"><table><colgroup><col class="coluna1"/><col class="coluna2"/><col class="coluna3"/></colgroup><tr><th>Agudo</th><th >Médio</th><th >Grave</th></tr><tr><td>Trompete</td><td>Trompa</td><td>Trombone</td></tr></table> </td></tr><tr><td>Audi</td><td>A4</td><td>2002</td><td>Saloon</td><td>Yes</td></tr>');
		}
		
}]);