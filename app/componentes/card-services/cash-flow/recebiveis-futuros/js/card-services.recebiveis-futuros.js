/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 12/02/2016
 *  - Conta corrente
 *  - Antecipação Bancária
 *
 *  Versão 1.0.1 - 03/02/2016
 *  - Opção de impressão disponível
 *
 *  Versão 1.0 - 20/10/2015
 *
 */

// App
angular.module("card-services-recebiveis-futuros", []) 

.controller("card-services-recebiveis-futurosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){ 
   
    $scope.contas = [];   
    $scope.recebiveis = [];                                      
    $scope.filtro = { datamin : new Date(), conta : null }; 
    $scope.total = { valorBruto : 0.0, valorDescontado : 0.0, valorLiquido : 0.0, valorAntecipacaoBancaria : 0.0 };  
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRecebiveisPos = 1; // posição da div que vai receber o loading progress                                         
    // flags                                   
    $scope.exibeTela = false;                                                      
                                                
    // Inicialização do controller
    $scope.cardServices_recebiveisFuturosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Cash Flow';                          
        $scope.pagina.subtitulo = 'Recebíveis Futuros';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.conta = null;
                    buscaContas();
                }else{ // reseta tudo e não faz buscas 
                    $scope.contas = []; 
                    $scope.filtro.conta = null;
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega contas
            buscaContas();
        }); 
        $scope.filtro.datamin.setDate($scope.filtro.datamin.getDate()+1);
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
        //buscaContas();
    };                                           
                                                
                                            
    
        
                                                
   /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // Filtros Por Data
        filtros.push({id: /*$campos.card.recebiveisfuturos.data*/ 100,
                      valor: ">" + $scope.getFiltroData($scope.filtro.datamin)});

        // Conta
        if($scope.filtro.conta && $scope.filtro.conta !== null){
           filtros.push({id: /*$campos.card.recebiveisfuturos.cdContaCorrente*/ 102, 
                         valor: $scope.filtro.conta.cdContaCorrente});  
        }

        return filtros;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        $scope.filtro.conta = null; 
    }
    
    
                                                 
    
    // CONTAS
    /**
      * Busca as contas
      */
    var buscaContas = function(nu_cnpj){
        
       if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                        valor: $scope.usuariologado.grupoempresa.id_grupo},
                       {id: /*$campos.card.tbcontacorrente.flAtivo*/ 106,
                        valor: true}];
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0],
                                filtros)) 
            .then(function(dados){
                $scope.contas = dados.Registros;
                if($scope.filtro.conta && $scope.filtro.conta !== null)
                    $scope.filtro.conta = $filter('filter')($scope.contas, function(c) {return c.cdContaCorrente === $scope.filtro.conta.cdContaCorrente;})[0];
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(){
        // ...
    }; 
                                                
                                                
                                                
    
    // RECEBÍVEIS FUTUROS                                            
    /**
      * Obtem os recebíveis a partir dos filtros
      */
    $scope.buscaRecebiveisFuturos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        // Data deve ser superior ou igual a data corrente
        var dtNow = new Date();
        if($scope.filtro.datamin && ($scope.filtro.datamin.getFullYear() < dtNow.getFullYear() || ($scope.filtro.datamin.getFullYear() === dtNow.getFullYear() && $scope.filtro.datamin.getMonth() < dtNow.getMonth()) || ($scope.filtro.datamin.getFullYear() === dtNow.getFullYear() && $scope.filtro.datamin.getMonth() === dtNow.getMonth() && $scope.filtro.datamin.getDate() < dtNow.getDate()))){
            $scope.showModalAlerta('Data inicial deve ser igual ou superior a data corrente!', 'Atos Capital', 'OK', 
               function(){
                     $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                }
              );
            return; 
        }
        // Nova busca
        buscaRecebiveisFuturos();
    }
                                                
                                                
    var buscaRecebiveisFuturos = function(){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyRecebiveisPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       $webapi.get($apis.getUrl($apis.card.recebiveisfuturos, [$scope.token, 0], filtros)) 
            .then(function(dados){
                //console.log(dados);
                // Obtém os dados
                $scope.recebiveis = dados.Registros;
                // Totais
                $scope.total.valorBruto = dados.Totais.valorBruto;
                $scope.total.valorDescontado = dados.Totais.valorDescontado;
                $scope.total.valorLiquido = dados.Totais.valorLiquido;
                $scope.total.valorAntecipacaoBancaria = dados.Totais.valorAntecipacaoBancaria;

                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRecebiveisPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter recebíveis futuros (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRecebiveisPos);
              });           
    }
                                                
                                                
                                                
    // TABELA EXPANSÍVEL
    $scope.toggle = function(recebivel){
        if(!recebivel || recebivel === null) return;
        if(recebivel.collapsed) recebivel.collapsed = false;
        else recebivel.collapsed = true;
    }
    $scope.isExpanded = function(recebivel){
        if(!recebivel || recebivel === null) return false;
        return recebivel.collapsed;
    }
		
		//IMPRESSÃO
		$scope.imprimir = function(){
			
			/*
			
			e = Nome da empresa
			s = Nome da tela
			n = Número de níveis
			cl = Número de colunas
			t = Token
			c = CNPJ
			f = Filial
			d = Data
			
			*/
			
			/*if($scope.filtro.conta && $scope.filtro.conta !== null){  
				$window.open('views/print#?e=' + $scope.usuariologado.grupoempresa.ds_nome + '&s=' + "Relatório de Recebíveis Futuros" + '&n='+ 3 +'&cl='+4+'&t='+$scope.token+'&c='+$scope.filtro.conta.cdContaCorrente+'&f='+$scope.+
										 '&d='+ ">" + $scope.getFiltroData($scope.filtro.datamin), '_blank');
			}*/			
		}
    
}])