/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
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
   
    $scope.filiais = [];   
    $scope.recebiveis = [];                                      
    $scope.filtro = { datamin : new Date(), filial : null }; 
    $scope.total = { valorBruto : 0.0, valorDescontado : 0.0, valorLiquido : 0.0 };  
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
                    $scope.filtro.filial = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.filtro.filial = null;
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            buscaFiliais();
        }); 
        $scope.filtro.datamin.setDate($scope.filtro.datamin.getDate()+1);
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
        //buscaFiliais();
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

        // Filial
        if($scope.filtro.filial && $scope.filtro.filial !== null){
           filtros.push({id: /*$campos.card.recebiveisfuturos.nu_cnpj*/ 102, 
                         valor: $scope.filtro.filial.nu_cnpj});  
        }

        return filtros;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        $scope.filtro.filial = null; 
    }
    
    
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj){
        
       if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
       if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                      valor: $scope.usuariologado.empresa.nu_cnpj});
       
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.destinatario = null;
                else $scope.filtro.destinatario = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.destinatario); 
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
			if($scope.filtro.filial && $scope.filtro.filial !== null){  
				$window.open('views/print#?e=' + $scope.usuariologado.grupoempresa.ds_nome + '&s=' + "Relatório de Recebíveis Futuros" + '&n='+ 3 +'&cl='+4+'&t='+$scope.token+'&c='+$scope.filtro.filial.nu_cnpj+'&f='+$scope.filtro.filial.ds_fantasia+
										 '&d='+ ">" + $scope.getFiltroData($scope.filtro.datamin), '_blank');
			}			
		}
    
}])